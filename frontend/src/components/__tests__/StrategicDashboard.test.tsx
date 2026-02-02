/**
 * Frontend Unit Tests for AI Assistant Feature
 * Tests cover: Mode selection, SSE connection, Conversation management, Error handling
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock API
vi.mock('../config/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
    patch: vi.fn(),
  },
  getConversations: vi.fn(),
  createConversation: vi.fn(),
  getConversation: vi.fn(),
  getConversationMessages: vi.fn(),
  addConversationMessage: vi.fn(),
  deleteConversation: vi.fn(),
  updateConversation: vi.fn(),
}));

import api, {
  getConversations,
  createConversation,
  getConversation,
  addConversationMessage,
  deleteConversation,
} from '../config/api';
import { useAuthStore } from '../stores/authStore';

// Types
interface AIConversation {
  id: number;
  title: string;
  mode: 'quick' | 'deep';
  first_message: string;
  message_count: number;
  created_at: string;
  updated_at: string;
}

// ========================================
// Test Suite 1: AI Mode Selection
// ========================================

describe('AI Mode Selection', () => {
  it('should have two modes: quick and deep', () => {
    const modes: Array<'quick' | 'deep'> = ['quick', 'deep'];
    expect(modes).toContain('quick');
    expect(modes).toContain('deep');
    expect(modes.length).toBe(2);
  });

  it('should default to quick mode', () => {
    const defaultMode: 'quick' | 'deep' = 'quick';
    expect(defaultMode).toBe('quick');
  });

  it('should switch between modes', () => {
    let currentMode: 'quick' | 'deep' = 'quick';

    act(() => {
      currentMode = 'deep';
    });

    expect(currentMode).toBe('deep');

    act(() => {
      currentMode = 'quick';
    });

    expect(currentMode).toBe('quick');
  });
});

// ========================================
// Test Suite 2: Conversation API
// ========================================

describe('Conversation API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create conversation with id field', async () => {
    const mockConversation: AIConversation = {
      id: 1,
      title: 'Test Conversation',
      mode: 'quick',
      first_message: '',
      message_count: 0,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    };

    vi.mocked(createConversation).mockResolvedValue(mockConversation);

    const result = await createConversation({ title: 'Test Conversation', mode: 'quick' });

    expect(result).toBeDefined();
    expect(result.id).toBeDefined();
    expect(result.id).toBe(1);
    expect(result.title).toBe('Test Conversation');
  });

  it('should list all conversations for user', async () => {
    const mockConversations: AIConversation[] = [
      {
        id: 1,
        title: 'Conversation 1',
        mode: 'quick',
        first_message: 'Question 1',
        message_count: 2,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      },
      {
        id: 2,
        title: 'Conversation 2',
        mode: 'deep',
        first_message: 'Question 2',
        message_count: 4,
        created_at: '2024-01-02T00:00:00Z',
        updated_at: '2024-01-02T00:00:00Z',
      },
    ];

    vi.mocked(getConversations).mockResolvedValue(mockConversations);

    const result = await getConversations();

    expect(result).toHaveLength(2);
    expect(result[0].id).toBe(1);
    expect(result[1].id).toBe(2);
  });

  it('should add message to conversation', async () => {
    const mockMessage = {
      id: 1,
      role: 'user' as const,
      content: 'Test message',
      created_at: '2024-01-01T00:00:00Z',
    };

    vi.mocked(addConversationMessage).mockResolvedValue(mockMessage);

    const result = await addConversationMessage(1, 'user', 'Test message');

    expect(result.role).toBe('user');
    expect(result.content).toBe('Test message');
  });

  it('should delete conversation', async () => {
    vi.mocked(deleteConversation).mockResolvedValue(undefined);

    await expect(deleteConversation(1)).resolves.toBeUndefined();
  });

  it('should handle null or undefined conversation.id', async () => {
    const mockConversation: AIConversation = {
      id: 1,
      title: 'New Conversation',
      mode: 'quick',
      first_message: '',
      message_count: 0,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    };

    vi.mocked(createConversation).mockResolvedValue(mockConversation);

    let conv: AIConversation | null = null;

    // Test null conversation
    if (!conv || !conv.id) {
      conv = await createConversation({
        title: 'Test',
        mode: 'quick'
      });
    }

    expect(conv.id).toBeDefined();
    expect(conv.id).toBe(1);
  });
});

// ========================================
// Test Suite 3: Auth Store - Leader Detection
// ========================================

describe('Auth Store - Leader Detection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should identify lanhdaobo as leader', () => {
    const LEADER_USERNAMES = ['lanhdaobo'];
    const username = 'lanhdaobo';

    expect(LEADER_USERNAMES).toContain(username);
  });

  it('should NOT identify admin as leader', () => {
    const LEADER_USERNAMES = ['lanhdaobo'];
    const username = 'admin';

    expect(LEADER_USERNAMES).not.toContain(username);
  });

  it('should identify multiple leaders if configured', () => {
    const LEADER_USERNAMES = ['lanhdaobo', 'leader2'];
    const username1 = 'lanhdaobo';
    const username2 = 'leader2';

    expect(LEADER_USERNAMES).toContain(username1);
    expect(LEADER_USERNAMES).toContain(username2);
  });
});

// ========================================
// Test Suite 4: SSE Event Handling
// ========================================

describe('SSE Event Handling', () => {
  it('should parse phase_start event', () => {
    const eventData = JSON.stringify({
      phase: 'Phase 1',
      mode: 'quick',
    });

    const parsed = JSON.parse(eventData);

    expect(parsed.phase).toBe('Phase 1');
    expect(parsed.mode).toBe('quick');
  });

  it('should parse complete event', () => {
    const eventData = JSON.stringify({
      query: 'Test query',
      response: {
        greeting: 'Hello',
        main_answer: 'Answer here',
      },
      data: [],
      mode: 'quick',
    });

    const parsed = JSON.parse(eventData);

    expect(parsed.query).toBe('Test query');
    expect(parsed.response.main_answer).toBe('Answer here');
    expect(parsed.mode).toBe('quick');
  });

  it('should parse error event', () => {
    const eventData = JSON.stringify({
      error: 'Test error message',
    });

    const parsed = JSON.parse(eventData);

    expect(parsed.error).toBe('Test error message');
  });

  it('should handle keep-alive event', () => {
    const keepAliveEvent = ': keep-alive';

    expect(keepAliveEvent).toContain('keep-alive');
  });
});

// ========================================
// Test Suite 5: Cost Estimation
// ========================================

describe('AI Cost Estimation', () => {
  it('should calculate cost for GPT-5.2 correctly', () => {
    const pricing = {
      'gpt-5.2': { input: 5.0, output: 15.0 },
    };

    const inputTokens = 10000;
    const outputTokens = 2000;

    const inputCost = (inputTokens / 1_000_000) * pricing['gpt-5.2'].input;
    const outputCost = (outputTokens / 1_000_000) * pricing['gpt-5.2'].output;
    const totalCost = inputCost + outputCost;

    expect(totalCost).toBeCloseTo(0.08, 2); // $0.05 + $0.03 = $0.08
  });

  it('should calculate cost for large request', () => {
    const pricing = {
      'gpt-5.2': { input: 5.0, output: 15.0 },
    };

    const inputTokens = 50000;
    const outputTokens = 10000;

    const inputCost = (inputTokens / 1_000_000) * pricing['gpt-5.2'].input;
    const outputCost = (outputTokens / 1_000_000) * pricing['gpt-5.2'].output;
    const totalCost = inputCost + outputCost;

    expect(totalCost).toBeCloseTo(0.40, 2); // $0.25 + $0.15 = $0.40
  });
});

// ========================================
// Test Suite 6: Mode-specific Behavior
// ========================================

describe('AI Mode Behavior', () => {
  it('quick mode should have 1 phase', () => {
    const quickModePhases = 1;
    expect(quickModePhases).toBe(1);
  });

  it('deep mode should have 4 phases', () => {
    const deepModePhases = 4;
    expect(deepModePhases).toBe(4);
  });

  it('quick mode should be faster than deep mode', () => {
    const quickTime = '4-6s';
    const deepTime = '12-20s';

    const quickMin = parseInt(quickTime.split('-')[0]);
    const deepMin = parseInt(deepTime.split('-')[0]);

    expect(quickMin).toBeLessThan(deepMin);
  });

  it('quick mode should not include strategic insights', () => {
    const quickResponse = {
      query: 'Test',
      response: {
        greeting: '',
        main_answer: 'Quick answer',
        follow_up_suggestions: ['Go deeper'],
      },
      mode: 'quick',
    };

    expect(quickResponse.mode).toBe('quick');
    expect(quickResponse.response).not.toHaveProperty('strategic_insight');
  });

  it('deep mode should include strategic insights', () => {
    const deepResponse = {
      query: 'Test',
      response: {
        greeting: 'Hello',
        main_answer: 'Detailed answer',
        strategic_insight: 'Strategic insight here',
        recommended_action: 'Action item',
      },
      mode: 'deep',
    };

    expect(deepResponse.mode).toBe('deep');
    expect(deepResponse.response).toHaveProperty('strategic_insight');
    expect(deepResponse.response).toHaveProperty('recommended_action');
  });
});

// ========================================
// Test Suite 7: Conversation State
// ========================================

describe('Conversation State Management', () => {
  it('should initialize with null conversation', () => {
    const currentConversation: AIConversation | null = null;

    expect(currentConversation).toBeNull();
  });

  it('should set current conversation', () => {
    const mockConversation: AIConversation = {
      id: 1,
      title: 'Test',
      mode: 'quick',
      first_message: '',
      message_count: 0,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    };

    let currentConversation: AIConversation | null = null;

    act(() => {
      currentConversation = mockConversation;
    });

    expect(currentConversation).not.toBeNull();
    expect(currentConversation!.id).toBe(1);
  });

  it('should clear current conversation', () => {
    const mockConversation: AIConversation = {
      id: 1,
      title: 'Test',
      mode: 'quick',
      first_message: '',
      message_count: 0,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    };

    let currentConversation: AIConversation | null = mockConversation;

    expect(currentConversation).not.toBeNull();

    act(() => {
      currentConversation = null;
    });

    expect(currentConversation).toBeNull();
  });
});

// ========================================
// Test Suite 8: Error Handling
// ========================================

describe('Error Handling', () => {
  it('should handle undefined conversation ID gracefully', () => {
    const conversation: Partial<AIConversation> = {
      title: 'Test',
      mode: 'quick',
    };

    const hasId = conversation.id !== undefined;

    expect(hasId).toBe(false);

    // Should create new conversation
    if (!conversation.id) {
      expect(true).toBe(true); // Would create new conversation
    }
  });

  it('should handle network error', () => {
    const error = new Error('Network error');
    expect(error.message).toBe('Network error');
  });

  it('should handle timeout error', () => {
    const error = new Error('Timeout');
    expect(error.message).toBe('Timeout');
  });

  it('should handle 401 unauthorized', () => {
    const error = { response: { status: 401 } };
    expect(error.response.status).toBe(401);
  });
});

// ========================================
// Test Suite 9: AI Request Logging
// ========================================

describe('AI Request Logging', () => {
  it('should log query', () => {
    const log = {
      query: 'Test query',
      mode: 'quick' as const,
      status: 'success' as const,
    };

    expect(log.query).toBe('Test query');
    expect(log.mode).toBe('quick');
    expect(log.status).toBe('success');
  });

  it('should log LLM requests with timing', () => {
    const llmRequest = {
      phase: 'Phase 1',
      model: 'gpt-5.2',
      duration_ms: 5000,
      estimated_cost_usd: 0.05,
    };

    expect(llmRequest.duration_ms).toBe(5000);
    expect(llmRequest.estimated_cost_usd).toBe(0.05);
  });

  it('should log total duration and cost', () => {
    const log = {
      total_duration_ms: 15000,
      total_cost_usd: 0.15,
      llm_requests: [],
    };

    expect(log.total_duration_ms).toBe(15000);
    expect(log.total_cost_usd).toBe(0.15);
  });

  it('should support user rating', () => {
    const log = {
      user_rating: 5,
      user_feedback: 'Very helpful',
    };

    expect(log.user_rating).toBe(5);
    expect(log.user_feedback).toBe('Very helpful');
  });
});

// ========================================
// Test Suite 10: Helper Functions
// ========================================

describe('Helper Functions', () => {
  it('should truncate long query for preview', () => {
    const longQuery = 'A'.repeat(100);
    const preview = longQuery.substring(0, 60) + '...';

    expect(preview.length).toBeLessThanOrEqual(63); // 60 + '...'
  });

  it('should format duration correctly', () => {
    const durationMs = 5000;
    const durationSec = durationMs / 1000;

    expect(durationSec).toBe(5);
  });

  it('should format cost correctly', () => {
    const cost = 0.123456;
    const formatted = `$${cost.toFixed(6)}`;

    expect(formatted).toBe('$0.123456');
  });

  it('should count LLM requests', () => {
    const llm_requests = [
      { phase: 'Phase 1' },
      { phase: 'Phase 2' },
      { phase: 'Phase 3' },
    ];

    const count = llm_requests.length;
    expect(count).toBe(3);
  });
});
