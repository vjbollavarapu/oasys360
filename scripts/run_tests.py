#!/usr/bin/env python
"""
Comprehensive test runner for OASYS Platform
Runs all tests and generates coverage reports
"""
import os
import sys
import subprocess
import time
from pathlib import Path

def run_command(command, description):
    """Run a command and return success status"""
    print(f"\n{'='*60}")
    print(f"🔄 {description}")
    print(f"{'='*60}")

    # Ensure we use the same python interpreter
    if command.startswith("python "):
        command = command.replace("python ", f"{sys.executable} ")
    
    print(f"Running: {command}")
    
    start_time = time.time()
    result = subprocess.run(command, shell=True, capture_output=True, text=True)
    end_time = time.time()
    
    print(f"\nOutput:")
    print(result.stdout)
    
    if result.stderr:
        print(f"\nErrors:")
        print(result.stderr)
    
    print(f"\n⏱️  Time taken: {end_time - start_time:.2f} seconds")
    
    if result.returncode == 0:
        print(f"✅ {description} - SUCCESS")
    else:
        print(f"❌ {description} - FAILED (Exit code: {result.returncode})")
    
    return result.returncode == 0

def main():
    """Main test runner"""
    print("🚀 OASYS Platform - Comprehensive Test Suite")
    print("=" * 60)
    
    # Determine paths and change directory to backend
    script_path = Path(__file__).resolve()
    project_root = script_path.parent.parent
    backend_dir = project_root / 'apps' / 'backend'
    
    print(f"📂 Switching context to: {backend_dir}")
    try:
        os.chdir(backend_dir)
    except FileNotFoundError:
        print(f"❌ Error: Backend directory not found at {backend_dir}")
        sys.exit(1)

    # Check if we're in the right directory
    if not os.path.exists('manage.py'):
        print("❌ Error: manage.py not found in apps/backend. Please check the project structure.")
        sys.exit(1)
    
    # Test results tracking
    test_results = {}
    
    # 1. Django system check
    success = run_command(
        f"python manage.py check --settings=backend.settings",
        "Django System Check"
    )
    test_results['system_check'] = success
    
    # 2. Run model tests
    model_tests = [
        ('authentication', 'Authentication Models'),
        ('tenants', 'Tenant Models'),
        ('accounting', 'Accounting Models'),
        ('invoicing', 'Invoicing Models'),
        ('banking', 'Banking Models'),
        ('sales', 'Sales Models'),
        ('purchase', 'Purchase Models'),
        ('ai_processing', 'AI Processing Models'),
        ('web3_integration', 'Web3 Integration Models'),
    ]
    
    for app, description in model_tests:
        success = run_command(
            f"python manage.py test {app}.tests --settings=backend.settings --verbosity=2",
            f"{description} Tests"
        )
        test_results[f'{app}_models'] = success
    
    # 3. Run API tests
    api_tests = [
        ('authentication', 'Authentication APIs'),
        ('tenants', 'Tenant APIs'),
        ('accounting', 'Accounting APIs'),
        ('invoicing', 'Invoicing APIs'),
        ('banking', 'Banking APIs'),
        ('sales', 'Sales APIs'),
        ('purchase', 'Purchase APIs'),
        ('ai_processing', 'AI Processing APIs'),
        ('web3_integration', 'Web3 Integration APIs'),
    ]
    
    for app, description in api_tests:
        success = run_command(
            f"python manage.py test {app}.tests --settings=backend.settings --verbosity=2",
            f"{description} Tests"
        )
        test_results[f'{app}_apis'] = success
    
    # 4. Run all tests together
    success = run_command(
        "python manage.py test --settings=backend.settings --verbosity=2",
        "All Tests Together"
    )
    test_results['all_tests'] = success
    
    # 5. Generate coverage report (if coverage is installed)
    try:
        success = run_command(
            "coverage run --source='.' manage.py test --settings=backend.settings",
            "Coverage Analysis"
        )
        test_results['coverage'] = success
        
        if success:
            run_command(
                "coverage report --show-missing",
                "Coverage Report"
            )
            run_command(
                "coverage html",
                "HTML Coverage Report"
            )
    except FileNotFoundError:
        print("\n⚠️  Coverage not installed. Install with: pip install coverage")
        test_results['coverage'] = False
    
    # 6. Performance tests
    success = run_command(
        "python manage.py test --settings=backend.settings --verbosity=1 --parallel",
        "Parallel Performance Tests"
    )
    test_results['performance'] = success
    
    # 7. Security tests
    security_checks = [
        ("python manage.py check --deploy --settings=backend.settings", "Security Check"),
        ("python manage.py validate --settings=backend.settings", "Model Validation"),
    ]

    
    for command, description in security_checks:
        success = run_command(command, description)
        test_results[f'security_{description.lower().replace(" ", "_")}'] = success
    
    # Print summary
    print(f"\n{'='*60}")
    print("📊 TEST SUMMARY")
    print(f"{'='*60}")
    
    total_tests = len(test_results)
    passed_tests = sum(test_results.values())
    failed_tests = total_tests - passed_tests
    
    print(f"Total Tests: {total_tests}")
    print(f"✅ Passed: {passed_tests}")
    print(f"❌ Failed: {failed_tests}")
    print(f"📈 Success Rate: {(passed_tests/total_tests)*100:.1f}%")
    
    print(f"\nDetailed Results:")
    for test_name, result in test_results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"  {test_name}: {status}")
    
    if failed_tests == 0:
        print(f"\n🎉 ALL TESTS PASSED! The OASYS platform is ready for production!")
        return 0
    else:
        print(f"\n⚠️  {failed_tests} tests failed. Please review and fix the issues.")
        return 1

if __name__ == "__main__":
    sys.exit(main())
