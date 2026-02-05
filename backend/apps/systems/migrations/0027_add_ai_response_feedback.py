# Generated manually - Add AIResponseFeedback model
import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('systems', '0026_add_data_volume_gb'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='AIResponseFeedback',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('query', models.TextField(help_text='The original question asked by user', verbose_name='User Question')),
                ('mode', models.CharField(choices=[('quick', 'Quick Mode'), ('deep', 'Deep Mode')], default='quick', max_length=20, verbose_name='AI Mode')),
                ('response_data', models.JSONField(help_text='Full response from AI including thinking, sql, answer, etc.', verbose_name='AI Response Data')),
                ('conversation_context', models.JSONField(blank=True, help_text='Previous Q&A context if this was a follow-up question', null=True, verbose_name='Conversation Context')),
                ('rating', models.CharField(choices=[('positive', 'Thumbs Up - Helpful'), ('negative', 'Thumbs Down - Not Helpful')], max_length=20, verbose_name='Rating')),
                ('feedback_text', models.TextField(blank=True, help_text='Optional: User can provide detailed feedback explaining the rating', null=True, verbose_name='Detailed Feedback')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Created At')),
                ('analyzed', models.BooleanField(default=False, help_text='Whether this feedback has been analyzed to generate policies', verbose_name='Analyzed for Policy')),
                ('generated_policies', models.JSONField(blank=True, help_text='Policy rules extracted from this feedback', null=True, verbose_name='Generated Policies')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='ai_feedbacks', to=settings.AUTH_USER_MODEL, verbose_name='User')),
            ],
            options={
                'verbose_name': 'AI Response Feedback',
                'verbose_name_plural': 'AI Response Feedbacks',
                'db_table': 'systems_ai_response_feedback',
                'ordering': ['-created_at'],
            },
        ),
        migrations.AddIndex(
            model_name='airesponsefeedback',
            index=models.Index(fields=['-created_at'], name='systems_ai__created_5a8e6e_idx'),
        ),
        migrations.AddIndex(
            model_name='airesponsefeedback',
            index=models.Index(fields=['user', '-created_at'], name='systems_ai__user_id_5c8b4d_idx'),
        ),
        migrations.AddIndex(
            model_name='airesponsefeedback',
            index=models.Index(fields=['rating'], name='systems_ai__rating_7d9e2f_idx'),
        ),
        migrations.AddIndex(
            model_name='airesponsefeedback',
            index=models.Index(fields=['analyzed'], name='systems_ai__analyze_8f1a3c_idx'),
        ),
    ]
