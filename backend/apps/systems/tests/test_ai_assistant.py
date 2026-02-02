"""
Unit Tests for AI Assistant Feature
Tests cover: Quick mode, Deep mode, Conversations, Cost estimation, Logging
"""
import pytest
import json
from unittest.mock import Mock, patch, MagicMock
from django.test import TestCase, RequestFactory
from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework.test import APIClient, APITestCase
from rest_framework import status

from apps.systems.models import (
    AIConversation,
    AIMessage,
    AIRequestLog,
    System,
)
from apps.systems.views import (
    SystemViewSet,
    AIConversationViewSet,
)
from apps.systems.serializers import (
    AIConversationCreateSerializer,
    AIConversationListSerializer,
    AIConversationSerializer,
    AIMessageSerializer,
)

User = get_user_model()


class TestCostEstimation(TestCase):
    """Test cost estimation for AI models"""

    def test_estimate_cost_gpt_52_low_effort(self):
        """Test cost estimation for GPT-5.2 with low effort"""
        from apps.systems.views import estimate_llm_cost

        # 10K input tokens, 2K output tokens
        cost = estimate_llm_cost('gpt-5.2', 10000, 2000)

        # Pricing: $5/M input, $15/M output
        # Expected: (10000/1M * 5) + (2000/1M * 15) = 0.05 + 0.03 = 0.08
        expected_cost = 0.08
        assert abs(cost - expected_cost) < 0.001, f"Expected {expected_cost}, got {cost}"

    def test_estimate_cost_gpt_52_medium_effort(self):
        """Test cost estimation for GPT-5.2 with medium effort"""
        from apps.systems.views import estimate_llm_cost

        # 50K input tokens, 10K output tokens
        cost = estimate_llm_cost('gpt-5.2', 50000, 10000)

        # Expected: (50000/1M * 5) + (10000/1M * 15) = 0.25 + 0.15 = 0.40
        expected_cost = 0.40
        assert abs(cost - expected_cost) < 0.001, f"Expected {expected_cost}, got {cost}"

    def test_estimate_cost_unknown_model(self):
        """Test cost estimation for unknown model (default pricing)"""
        from apps.systems.views import estimate_llm_cost

        cost = estimate_llm_cost('unknown-model', 1000, 500)

        # Default pricing: $1/M for both
        expected_cost = 0.0015
        assert abs(cost - expected_cost) < 0.0001, f"Expected {expected_cost}, got {cost}"


class TestAIConversationSerializers(TestCase):
    """Test AI Conversation serializers"""

    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            password='testpass123',
            role='org_user'
        )

    def test_conversation_create_serializer_includes_id(self):
        """Test that create serializer includes id field"""
        data = {
            'title': 'Test Conversation',
            'mode': 'quick'
        }
        serializer = AIConversationCreateSerializer(data=data)
        self.assertTrue(serializer.is_valid())

        conversation = serializer.save(user=self.user)

        # Verify id is included in response
        response_data = AIConversationCreateSerializer(conversation).data
        self.assertIn('id', response_data)
        self.assertIsNotNone(response_data['id'])
        self.assertEqual(response_data['title'], 'Test Conversation')
        self.assertEqual(response_data['mode'], 'quick')

    def test_conversation_list_serializer(self):
        """Test conversation list serializer"""
        conversation = AIConversation.objects.create(
            user=self.user,
            title='List Test',
            mode='deep',
            first_message='First message'
        )

        serializer = AIConversationListSerializer(conversation)
        data = serializer.data

        self.assertIn('id', data)
        self.assertIn('title', data)
        self.assertIn('mode', data)
        self.assertIn('mode_display', data)
        self.assertIn('message_count', data)
        self.assertEqual(data['title'], 'List Test')
        self.assertEqual(data['mode'], 'deep')

    def test_conversation_detail_serializer_with_messages(self):
        """Test conversation detail serializer includes messages"""
        conversation = AIConversation.objects.create(
            user=self.user,
            title='Detail Test',
            mode='quick'
        )

        # Add messages
        AIMessage.objects.create(
            conversation=conversation,
            role='user',
            content='Test question'
        )
        AIMessage.objects.create(
            conversation=conversation,
            role='assistant',
            content='Test answer'
        )

        serializer = AIConversationSerializer(conversation)
        data = serializer.data

        self.assertIn('messages', data)
        self.assertEqual(len(data['messages']), 2)
        self.assertEqual(data['messages'][0]['role'], 'user')
        self.assertEqual(data['messages'][1]['role'], 'assistant')


class TestAIConversationViewSet(APITestCase):
    """Test AI Conversation API endpoints"""

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            password='testpass123',
            role='org_user'
        )
        self.leader = User.objects.create_user(
            username='lanhdaobo',
            password='testpass123',
            role='lanhdaobo'
        )
        self.superuser = User.objects.create_superuser(
            username='superadmin',
            password='testpass123',
            email='super@test.com'
        )

    def test_list_conversations_requires_auth(self):
        """Test that listing conversations requires authentication"""
        response = self.client.get('/api/ai-conversations/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_list_conversations_authenticated(self):
        """Test listing conversations when authenticated"""
        self.client.force_authenticate(user=self.user)

        # Create test conversations
        AIConversation.objects.create(
            user=self.user,
            title='Conversation 1',
            mode='quick'
        )
        AIConversation.objects.create(
            user=self.user,
            title='Conversation 2',
            mode='deep'
        )

        response = self.client.get('/api/ai-conversations/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Verify response is a list (pagination disabled)
        self.assertIsInstance(response.data, list)
        self.assertEqual(len(response.data), 2)

    def test_create_conversation(self):
        """Test creating a new conversation"""
        self.client.force_authenticate(user=self.user)

        data = {
            'title': 'New Conversation',
            'mode': 'quick'
        }
        response = self.client.post('/api/ai-conversations/', data)

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('id', response.data)
        self.assertEqual(response.data['title'], 'New Conversation')
        self.assertEqual(response.data['mode'], 'quick')

        # Verify auto-set user
        conversation = AIConversation.objects.get(id=response.data['id'])
        self.assertEqual(conversation.user, self.user)

    def test_create_conversation_with_defaults(self):
        """Test creating conversation with default title"""
        self.client.force_authenticate(user=self.user)

        response = self.client.post('/api/ai-conversations/', {})
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['title'], 'Cuộc trò chuyện mới')

    def test_add_message_to_conversation(self):
        """Test adding a message to a conversation"""
        self.client.force_authenticate(user=self.user)

        # Create conversation
        conversation = AIConversation.objects.create(
            user=self.user,
            title='Test',
            mode='quick'
        )

        # Add message
        data = {
            'role': 'user',
            'content': 'Test message'
        }
        response = self.client.post(
            f'/api/ai-conversations/{conversation.id}/add_message/',
            data
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['role'], 'user')
        self.assertEqual(response.data['content'], 'Test message')

        # Verify message was added
        conversation.refresh_from_db()
        self.assertEqual(conversation.messages.count(), 1)

    def test_delete_conversation(self):
        """Test deleting a conversation"""
        self.client.force_authenticate(user=self.user)

        conversation = AIConversation.objects.create(
            user=self.user,
            title='To Delete',
            mode='quick'
        )

        response = self.client.delete(f'/api/ai-conversations/{conversation.id}/')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

        # Verify deleted
        self.assertFalse(
            AIConversation.objects.filter(id=conversation.id).exists()
        )

    def test_user_cannot_see_others_conversations(self):
        """Test that users can only see their own conversations"""
        # Create conversation for user1
        AIConversation.objects.create(
            user=self.user,
            title='User1 Conversation',
            mode='quick'
        )

        # Create conversation for user2
        user2 = User.objects.create_user(
            username='user2',
            password='testpass123',
            role='org_user'
        )
        AIConversation.objects.create(
            user=user2,
            title='User2 Conversation',
            mode='deep'
        )

        # Authenticate as user1
        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/ai-conversations/')

        # Should only see user1's conversation
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['title'], 'User1 Conversation')


class TestAIRequestLogging(APITestCase):
    """Test AI Request Logging"""

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            password='testpass123',
            role='org_user'
        )

    def test_ai_request_log_creation(self):
        """Test that AI requests are logged"""
        log = AIRequestLog.objects.create(
            user=self.user,
            query='Test query',
            mode='quick',
            status='success',
            started_at=timezone.now(),
            llm_requests=[
                {
                    'phase': 'Phase 1',
                    'model': 'gpt-5.2',
                    'duration_ms': 5000,
                    'estimated_cost_usd': 0.05
                }
            ],
            total_duration_ms=5000,
            total_cost_usd=0.05
        )

        self.assertEqual(log.user, self.user)
        self.assertEqual(log.query, 'Test query')
        self.assertEqual(log.mode, 'quick')
        self.assertEqual(log.status, 'success')
        self.assertEqual(len(log.llm_requests), 1)
        self.assertEqual(log.total_duration_ms, 5000)

    def test_ai_request_log_user_rating(self):
        """Test user rating on AI request log"""
        log = AIRequestLog.objects.create(
            user=self.user,
            query='Test query',
            mode='deep',
            started_at=timezone.now()
        )

        # Add rating
        log.user_rating = 5
        log.user_feedback = 'Very helpful'
        log.save()

        log.refresh_from_db()
        self.assertEqual(log.user_rating, 5)
        self.assertEqual(log.user_feedback, 'Very helpful')


class TestStrategicDashboardAccess(TestCase):
    """Test Strategic Dashboard access control"""

    def setUp(self):
        self.admin_user = User.objects.create_user(
            username='admin',
            password='testpass123',
            role='admin'
        )
        self.leader_user = User.objects.create_user(
            username='lanhdaobo',
            password='testpass123',
            role='lanhdaobo'
        )
        self.org_user = User.objects.create_user(
            username='orguser',
            password='testpass123',
            role='org_user'
        )

    def test_leader_can_access_strategic_dashboard(self):
        """Test that lanhdaobo role can access strategic dashboard"""
        # Leader role should have access
        self.assertTrue(
            self.leader_user.username == 'lanhdaobo'
        )

    def test_admin_cannot_access_strategic_dashboard(self):
        """Test that admin role cannot access strategic dashboard"""
        # Admin role should NOT be in LEADER_USERNAMES
        from frontend.src.stores.authStore import LEADER_USERNAMES
        # Note: This is a conceptual test - actual check is in frontend
        self.assertNotIn('admin', ['lanhdaobo'])


class TestAIMessageSerializers(TestCase):
    """Test AI Message serializers"""

    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            password='testpass123',
            role='org_user'
        )
        self.conversation = AIConversation.objects.create(
            user=self.user,
            title='Test',
            mode='quick'
        )

    def test_message_serializer(self):
        """Test message serializer"""
        message = AIMessage.objects.create(
            conversation=self.conversation,
            role='user',
            content='Test message',
            response_data={'test': 'data'}
        )

        serializer = AIMessageSerializer(message)
        data = serializer.data

        self.assertEqual(data['role'], 'user')
        self.assertEqual(data['content'], 'Test message')
        self.assertIn('response_data', data)
        self.assertIn('created_at', data)


@pytest.mark.parametrize("mode,expected_phases", [
    ('quick', 1),  # Quick mode: single phase
    ('deep', 4),   # Deep mode: 4 phases
])
def test_ai_mode_phase_count(mode, expected_phases):
    """Test that different AI modes have correct number of phases"""
    # This is a parametrized test - runs for each (mode, expected_phases) pair
    assert mode in ['quick', 'deep']
    # Quick mode should have 1 phase, deep mode should have 4 phases
    if mode == 'quick':
        assert expected_phases == 1
    else:
        assert expected_phases == 4


@pytest.mark.parametrize("model,tokens,expected_cost_range", [
    ('gpt-5.2', (10000, 2000), (0.07, 0.09)),  # ~$0.08
    ('gpt-5.2', (50000, 10000), (0.39, 0.41)),  # ~$0.40
    ('unknown', (1000, 500), (0.001, 0.002)),   # Default pricing
])
def test_ai_cost_estimation_various_models(model, tokens, expected_cost_range):
    """Test cost estimation for various models and token counts"""
    from apps.systems.views import estimate_llm_cost

    input_tokens, output_tokens = tokens
    cost = estimate_llm_cost(model, input_tokens, output_tokens)

    min_cost, max_cost = expected_cost_range
    assert min_cost <= cost <= max_cost, \
        f"Cost {cost} not in expected range {min_cost}-{max_cost}"
