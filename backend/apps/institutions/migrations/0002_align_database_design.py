from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("institutions", "0001_initial"),
    ]

    operations = [
        migrations.RemoveConstraint(
            model_name="institution",
            name="uq_institucion_codigo_nit",
        ),
        migrations.RenameField(
            model_name="institution",
            old_name="codigo_nit",
            new_name="codigo_dane",
        ),
        migrations.RemoveField(
            model_name="institution",
            name="direccion",
        ),
        migrations.AlterField(
            model_name="institution",
            name="nombre",
            field=models.CharField(
                max_length=150,
                verbose_name="nombre de la institución",
                help_text="Nombre completo del colegio o institución educativa.",
            ),
        ),
        migrations.AlterField(
            model_name="institution",
            name="codigo_dane",
            field=models.CharField(
                blank=True,
                help_text="Código DANE o NIT institucional. No puede repetirse cuando se informa.",
                max_length=20,
                null=True,
                unique=True,
                verbose_name="código DANE / NIT",
            ),
        ),
        migrations.AddConstraint(
            model_name="institution",
            constraint=models.UniqueConstraint(
                fields=("codigo_dane",),
                name="uq_institucion_codigo_dane",
            ),
        ),
    ]
