"""
Django management command for creating optimized indexes for multi-tenant system.
"""

from django.core.management.base import BaseCommand
from django.db import connection
from django.apps import apps
from backend.query_optimization import query_optimizer


class Command(BaseCommand):
    help = 'Create optimized indexes for multi-tenant system'
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--app',
            type=str,
            help='Specific app to create indexes for',
        )
        parser.add_argument(
            '--model',
            type=str,
            help='Specific model to create indexes for',
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what indexes would be created without creating them',
        )
        parser.add_argument(
            '--force',
            action='store_true',
            help='Force creation even if indexes already exist',
        )
    
    def handle(self, *args, **options):
        app_name = options.get('app')
        model_name = options.get('model')
        dry_run = options.get('dry_run', False)
        force = options.get('force', False)
        
        if dry_run:
            self.stdout.write(self.style.WARNING('DRY RUN MODE - No indexes will be created'))
        
        # Get models to process
        models_to_process = self._get_models_to_process(app_name, model_name)
        
        total_indexes = 0
        created_indexes = 0
        skipped_indexes = 0
        
        for model in models_to_process:
            self.stdout.write(f'Processing model: {model.__name__}')
            
            # Get optimized indexes for model
            indexes = query_optimizer.get_optimized_indexes(model)
            total_indexes += len(indexes)
            
            for index in indexes:
                if self._create_index(index, model, dry_run, force):
                    created_indexes += 1
                else:
                    skipped_indexes += 1
        
        # Summary
        self.stdout.write('\n' + '='*50)
        self.stdout.write(f'Total indexes: {total_indexes}')
        self.stdout.write(f'Created indexes: {created_indexes}')
        self.stdout.write(f'Skipped indexes: {skipped_indexes}')
        
        if dry_run:
            self.stdout.write(self.style.WARNING('DRY RUN COMPLETED - No indexes were actually created'))
        else:
            self.stdout.write(self.style.SUCCESS('Index creation completed successfully'))
    
    def _get_models_to_process(self, app_name, model_name):
        """Get models to process based on options"""
        models_to_process = []
        
        if app_name and model_name:
            # Specific app and model
            try:
                model = apps.get_model(app_name, model_name)
                models_to_process.append(model)
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'Error getting model {app_name}.{model_name}: {e}'))
                return []
        
        elif app_name:
            # Specific app
            try:
                app_config = apps.get_app_config(app_name)
                models_to_process = list(app_config.get_models())
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'Error getting app {app_name}: {e}'))
                return []
        
        elif model_name:
            # Specific model (search all apps)
            for app_config in apps.get_app_configs():
                try:
                    model = app_config.get_model(model_name)
                    models_to_process.append(model)
                    break
                except Exception:
                    continue
            
            if not models_to_process:
                self.stdout.write(self.style.ERROR(f'Model {model_name} not found'))
                return []
        
        else:
            # All models
            for app_config in apps.get_app_configs():
                models_to_process.extend(list(app_config.get_models()))
        
        return models_to_process
    
    def _create_index(self, index, model, dry_run, force):
        """Create a single index"""
        try:
            with connection.cursor() as cursor:
                # Check if index already exists
                if not force:
                    cursor.execute("""
                        SELECT COUNT(*) FROM pg_indexes 
                        WHERE indexname = %s AND tablename = %s
                    """, [index.name, model._meta.db_table])
                    
                    if cursor.fetchone()[0] > 0:
                        self.stdout.write(f'  Skipping {index.name} (already exists)')
                        return False
                
                # Create index
                index_sql = f"""
                    CREATE INDEX IF NOT EXISTS {index.name} 
                    ON {model._meta.db_table} ({', '.join(index.fields)})
                """
                
                if dry_run:
                    self.stdout.write(f'  Would create: {index_sql}')
                    return True
                else:
                    cursor.execute(index_sql)
                    self.stdout.write(f'  Created: {index.name}')
                    return True
        
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'  Failed to create {index.name}: {e}'))
            return False


class IndexAnalyzer:
    """
    Analyzer for database indexes in multi-tenant system.
    """
    
    def __init__(self):
        self.connection = connection
    
    def analyze_indexes(self, model):
        """Analyze indexes for a model"""
        with self.connection.cursor() as cursor:
            cursor.execute("""
                SELECT 
                    indexname,
                    indexdef,
                    tablename
                FROM pg_indexes 
                WHERE tablename = %s
                ORDER BY indexname
            """, [model._meta.db_table])
            
            return cursor.fetchall()
    
    def get_index_usage_stats(self, model):
        """Get index usage statistics"""
        with self.connection.cursor() as cursor:
            cursor.execute("""
                SELECT 
                    schemaname,
                    tablename,
                    indexname,
                    idx_scan,
                    idx_tup_read,
                    idx_tup_fetch
                FROM pg_stat_user_indexes 
                WHERE tablename = %s
                ORDER BY idx_scan DESC
            """, [model._meta.db_table])
            
            return cursor.fetchall()
    
    def get_table_stats(self, model):
        """Get table statistics"""
        with self.connection.cursor() as cursor:
            cursor.execute("""
                SELECT 
                    schemaname,
                    tablename,
                    n_tup_ins,
                    n_tup_upd,
                    n_tup_del,
                    n_live_tup,
                    n_dead_tup
                FROM pg_stat_user_tables 
                WHERE tablename = %s
            """, [model._meta.db_table])
            
            return cursor.fetchall()
    
    def suggest_indexes(self, model):
        """Suggest indexes based on table statistics"""
        suggestions = []
        
        # Get table stats
        table_stats = self.get_table_stats(model)
        if not table_stats:
            return suggestions
        
        # Get index usage stats
        index_stats = self.get_index_usage_stats(model)
        
        # Analyze and suggest
        # This would be implemented based on specific analysis logic
        
        return suggestions


class IndexOptimizer:
    """
    Optimizer for database indexes in multi-tenant system.
    """
    
    def __init__(self):
        self.connection = connection
    
    def optimize_indexes(self, model):
        """Optimize indexes for a model"""
        # Get current indexes
        analyzer = IndexAnalyzer()
        current_indexes = analyzer.analyze_indexes(model)
        
        # Get usage stats
        usage_stats = analyzer.get_index_usage_stats(model)
        
        # Analyze and optimize
        optimizations = self._analyze_index_usage(current_indexes, usage_stats)
        
        return optimizations
    
    def _analyze_index_usage(self, current_indexes, usage_stats):
        """Analyze index usage and suggest optimizations"""
        optimizations = []
        
        # Create usage map
        usage_map = {stat[2]: stat[3] for stat in usage_stats}  # indexname: idx_scan
        
        for index in current_indexes:
            index_name = index[0]
            usage_count = usage_map.get(index_name, 0)
            
            if usage_count == 0:
                optimizations.append({
                    'type': 'unused_index',
                    'index_name': index_name,
                    'suggestion': 'Consider dropping unused index',
                    'priority': 'low'
                })
            elif usage_count < 10:
                optimizations.append({
                    'type': 'low_usage_index',
                    'index_name': index_name,
                    'suggestion': 'Monitor index usage',
                    'priority': 'medium'
                })
        
        return optimizations
    
    def create_tenant_indexes(self, model):
        """Create tenant-specific indexes"""
        if not hasattr(model, 'tenant'):
            return []
        
        indexes = []
        
        # Tenant index (most important)
        indexes.append({
            'name': f'{model._meta.db_table}_tenant_idx',
            'fields': ['tenant_id'],
            'type': 'btree'
        })
        
        # Composite indexes for common queries
        common_fields = ['created_at', 'updated_at', 'is_active', 'status']
        for field in common_fields:
            if hasattr(model, field):
                indexes.append({
                    'name': f'{model._meta.db_table}_tenant_{field}_idx',
                    'fields': ['tenant_id', field],
                    'type': 'btree'
                })
        
        return indexes
    
    def create_performance_indexes(self, model):
        """Create performance-optimized indexes"""
        indexes = []
        
        # Partial indexes for common filters
        if hasattr(model, 'is_active'):
            indexes.append({
                'name': f'{model._meta.db_table}_active_idx',
                'fields': ['tenant_id', 'created_at'],
                'condition': 'is_active = true',
                'type': 'btree'
            })
        
        if hasattr(model, 'status'):
            indexes.append({
                'name': f'{model._meta.db_table}_status_idx',
                'fields': ['tenant_id', 'status', 'created_at'],
                'type': 'btree'
            })
        
        return indexes
