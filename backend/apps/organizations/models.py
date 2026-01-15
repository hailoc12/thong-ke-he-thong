from django.db import models


class Organization(models.Model):
    """Đơn vị trực thuộc Bộ"""
    name = models.CharField(max_length=255, unique=True, verbose_name='Tên đơn vị')
    code = models.CharField(max_length=50, unique=True, null=True, blank=True, verbose_name='Mã đơn vị')
    description = models.TextField(blank=True, verbose_name='Mô tả')
    contact_person = models.CharField(max_length=255, blank=True, verbose_name='Người liên hệ')
    contact_email = models.EmailField(blank=True, verbose_name='Email')
    contact_phone = models.CharField(max_length=20, blank=True, verbose_name='Số điện thoại')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'organizations'
        ordering = ['name']
        verbose_name = 'Đơn vị'
        verbose_name_plural = 'Đơn vị'

    def __str__(self):
        return self.name
