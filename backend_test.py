#!/usr/bin/env python3
"""
Comprehensive Backend API Testing for Schedule Management System
Tests all endpoints with proper authentication and role-based access control
"""

import requests
import json
import io
import pandas as pd
from datetime import datetime
import uuid
import os

# Get backend URL from environment
BACKEND_URL = "https://845355d1-aa64-4cdf-94af-555e48bb9079.preview.emergentagent.com/api"

class ScheduleAPITester:
    def __init__(self):
        self.base_url = BACKEND_URL
        self.admin_token = None
        self.coordinator_token = None
        self.employee_token = None
        self.test_results = []
        
    def log_test(self, test_name, success, message=""):
        """Log test results"""
        status = "✅ PASS" if success else "❌ FAIL"
        self.test_results.append({
            "test": test_name,
            "status": status,
            "message": message
        })
        print(f"{status}: {test_name} - {message}")
    
    def make_request(self, method, endpoint, token=None, data=None, files=None):
        """Make HTTP request with optional authentication"""
        url = f"{self.base_url}{endpoint}"
        headers = {"Content-Type": "application/json"}
        
        if token:
            headers["Authorization"] = f"Bearer {token}"
        
        try:
            if method == "GET":
                response = requests.get(url, headers=headers)
            elif method == "POST":
                if files:
                    # Remove Content-Type for file uploads
                    headers.pop("Content-Type", None)
                    response = requests.post(url, headers=headers, files=files)
                else:
                    response = requests.post(url, headers=headers, json=data)
            elif method == "PUT":
                response = requests.put(url, headers=headers, json=data)
            elif method == "DELETE":
                response = requests.delete(url, headers=headers)
            
            return response
        except Exception as e:
            print(f"Request failed: {str(e)}")
            return None
    
    def test_admin_initialization(self):
        """Test admin user initialization"""
        print("\n=== Testing Admin Initialization ===")
        
        response = self.make_request("POST", "/init-admin")
        if response and response.status_code in [200, 201]:
            self.log_test("Admin Initialization", True, "Admin user initialized successfully")
            return True
        else:
            error_msg = response.text if response else "No response"
            self.log_test("Admin Initialization", False, f"Failed: {error_msg}")
            return False
    
    def test_authentication(self):
        """Test user authentication system"""
        print("\n=== Testing Authentication System ===")
        
        # Test admin login
        login_data = {"username": "admin", "password": "admin123"}
        response = self.make_request("POST", "/login", data=login_data)
        
        if response and response.status_code == 200:
            data = response.json()
            if "access_token" in data and "user" in data:
                self.admin_token = data["access_token"]
                self.log_test("Admin Login", True, f"Admin logged in successfully, role: {data['user']['role']}")
            else:
                self.log_test("Admin Login", False, "Missing token or user data in response")
                return False
        else:
            error_msg = response.text if response else "No response"
            self.log_test("Admin Login", False, f"Login failed: {error_msg}")
            return False
        
        # Test invalid login
        invalid_login = {"username": "admin", "password": "wrongpassword"}
        response = self.make_request("POST", "/login", data=invalid_login)
        
        if response and response.status_code == 401:
            self.log_test("Invalid Login Rejection", True, "Invalid credentials properly rejected")
        else:
            self.log_test("Invalid Login Rejection", False, "Invalid login should return 401")
        
        # Test token validation
        response = self.make_request("GET", "/me", token=self.admin_token)
        if response and response.status_code == 200:
            user_data = response.json()
            if user_data.get("role") == "admin":
                self.log_test("Token Validation", True, "JWT token validation working")
            else:
                self.log_test("Token Validation", False, "User role not correctly returned")
        else:
            self.log_test("Token Validation", False, "Token validation failed")
        
        return True
    
    def test_user_management(self):
        """Test user management APIs"""
        print("\n=== Testing User Management ===")
        
        # Test user registration (create coordinator)
        coordinator_data = {
            "username": f"coordinator_{uuid.uuid4().hex[:8]}",
            "email": "coordinator@test.com",
            "full_name": "Test Coordinator",
            "password": "coord123",
            "role": "coordinator",
            "service": "Coordinación"
        }
        
        response = self.make_request("POST", "/register", data=coordinator_data)
        if response and response.status_code == 200:
            self.log_test("User Registration", True, "Coordinator registered successfully")
            
            # Login as coordinator
            coord_login = {"username": coordinator_data["username"], "password": "coord123"}
            login_response = self.make_request("POST", "/login", data=coord_login)
            if login_response and login_response.status_code == 200:
                self.coordinator_token = login_response.json()["access_token"]
                self.log_test("Coordinator Login", True, "Coordinator login successful")
        else:
            error_msg = response.text if response else "No response"
            self.log_test("User Registration", False, f"Registration failed: {error_msg}")
        
        # Test employee registration
        employee_data = {
            "username": f"employee_{uuid.uuid4().hex[:8]}",
            "email": "employee@test.com",
            "full_name": "Test Employee",
            "password": "emp123",
            "role": "employee",
            "service": "Servicio General"
        }
        
        response = self.make_request("POST", "/register", data=employee_data)
        if response and response.status_code == 200:
            self.log_test("Employee Registration", True, "Employee registered successfully")
            
            # Login as employee
            emp_login = {"username": employee_data["username"], "password": "emp123"}
            login_response = self.make_request("POST", "/login", data=emp_login)
            if login_response and login_response.status_code == 200:
                self.employee_token = login_response.json()["access_token"]
                self.log_test("Employee Login", True, "Employee login successful")
        else:
            error_msg = response.text if response else "No response"
            self.log_test("Employee Registration", False, f"Employee registration failed: {error_msg}")
        
        # Test get users (admin access)
        response = self.make_request("GET", "/users", token=self.admin_token)
        if response and response.status_code == 200:
            users = response.json()
            if isinstance(users, list) and len(users) >= 3:  # admin + coordinator + employee
                self.log_test("Get Users (Admin)", True, f"Retrieved {len(users)} users")
            else:
                self.log_test("Get Users (Admin)", False, "Unexpected users data")
        else:
            self.log_test("Get Users (Admin)", False, "Failed to get users")
        
        # Test get employees
        response = self.make_request("GET", "/employees", token=self.admin_token)
        if response and response.status_code == 200:
            employees = response.json()
            if isinstance(employees, list):
                self.log_test("Get Employees", True, f"Retrieved {len(employees)} employees")
            else:
                self.log_test("Get Employees", False, "Unexpected employees data")
        else:
            self.log_test("Get Employees", False, "Failed to get employees")
        
        # Test role-based access (employee trying to access users)
        response = self.make_request("GET", "/users", token=self.employee_token)
        if response and response.status_code == 403:
            self.log_test("Role-based Access Control", True, "Employee correctly denied access to users list")
        else:
            self.log_test("Role-based Access Control", False, "Employee should not access users list")
    
    def test_schedule_management(self):
        """Test schedule management APIs"""
        print("\n=== Testing Schedule Management ===")
        
        # Get employee ID for schedule creation
        response = self.make_request("GET", "/employees", token=self.admin_token)
        if not response or response.status_code != 200:
            self.log_test("Schedule Management Setup", False, "Could not get employees for testing")
            return
        
        employees = response.json()
        if not employees:
            self.log_test("Schedule Management Setup", False, "No employees found for testing")
            return
        
        employee_id = employees[0]["id"]
        
        # Create schedule
        schedule_data = {
            "id": str(uuid.uuid4()),
            "user_id": employee_id,
            "service": "Servicio General",
            "monday_start": "09:00",
            "monday_break_start": "12:00",
            "monday_break_end": "13:00",
            "monday_end": "17:00",
            "tuesday_start": "09:00",
            "tuesday_end": "17:00",
            "wednesday_start": "09:00",
            "wednesday_end": "17:00",
            "thursday_start": "09:00",
            "thursday_end": "17:00",
            "friday_start": "09:00",
            "friday_end": "17:00"
        }
        
        response = self.make_request("POST", "/schedules", token=self.admin_token, data=schedule_data)
        if response and response.status_code == 200:
            self.log_test("Create Schedule", True, "Schedule created successfully")
            schedule_id = response.json()["id"]
        else:
            error_msg = response.text if response else "No response"
            self.log_test("Create Schedule", False, f"Failed to create schedule: {error_msg}")
            return
        
        # Get all schedules (admin)
        response = self.make_request("GET", "/schedules", token=self.admin_token)
        if response and response.status_code == 200:
            schedules = response.json()
            if isinstance(schedules, list) and len(schedules) > 0:
                self.log_test("Get All Schedules (Admin)", True, f"Retrieved {len(schedules)} schedules")
            else:
                self.log_test("Get All Schedules (Admin)", False, "No schedules found")
        else:
            self.log_test("Get All Schedules (Admin)", False, "Failed to get schedules")
        
        # Get specific user schedule
        response = self.make_request("GET", f"/schedules/{employee_id}", token=self.admin_token)
        if response and response.status_code == 200:
            schedule = response.json()
            if schedule.get("user_id") == employee_id:
                self.log_test("Get User Schedule", True, "User schedule retrieved successfully")
            else:
                self.log_test("Get User Schedule", False, "Incorrect schedule data")
        else:
            self.log_test("Get User Schedule", False, "Failed to get user schedule")
        
        # Test employee accessing own schedule
        response = self.make_request("GET", "/my-schedule", token=self.employee_token)
        if response and response.status_code in [200, 404]:  # 404 is OK if no schedule exists for this employee
            if response.status_code == 200:
                self.log_test("Employee Own Schedule", True, "Employee can access own schedule")
            else:
                self.log_test("Employee Own Schedule", True, "Employee schedule not found (expected)")
        else:
            self.log_test("Employee Own Schedule", False, "Employee schedule access failed")
        
        # Update schedule
        updated_schedule = schedule_data.copy()
        updated_schedule["monday_start"] = "08:00"
        
        response = self.make_request("PUT", f"/schedules/{schedule_id}", token=self.admin_token, data=updated_schedule)
        if response and response.status_code == 200:
            self.log_test("Update Schedule", True, "Schedule updated successfully")
        else:
            error_msg = response.text if response else "No response"
            self.log_test("Update Schedule", False, f"Failed to update schedule: {error_msg}")
        
        # Test employee trying to create schedule (should fail)
        response = self.make_request("POST", "/schedules", token=self.employee_token, data=schedule_data)
        if response and response.status_code == 403:
            self.log_test("Schedule Creation Access Control", True, "Employee correctly denied schedule creation")
        else:
            self.log_test("Schedule Creation Access Control", False, "Employee should not create schedules")
    
    def test_schedule_requests(self):
        """Test schedule request system"""
        print("\n=== Testing Schedule Request System ===")
        
        # Create schedule request (employee)
        request_data = {
            "requested_date": "2024-01-15",
            "request_type": "schedule_change",
            "current_schedule": "09:00-17:00",
            "requested_schedule": "10:00-18:00",
            "reason": "Personal appointment in the morning"
        }
        
        response = self.make_request("POST", "/schedule-requests", token=self.employee_token, data=request_data)
        if response and response.status_code == 200:
            request_id = response.json()["id"]
            self.log_test("Create Schedule Request", True, "Schedule request created successfully")
        else:
            error_msg = response.text if response else "No response"
            self.log_test("Create Schedule Request", False, f"Failed to create request: {error_msg}")
            return
        
        # Create day off request
        dayoff_request = {
            "requested_date": "2024-01-20",
            "request_type": "day_off",
            "reason": "Medical appointment"
        }
        
        response = self.make_request("POST", "/schedule-requests", token=self.employee_token, data=dayoff_request)
        if response and response.status_code == 200:
            self.log_test("Create Day Off Request", True, "Day off request created successfully")
        else:
            error_msg = response.text if response else "No response"
            self.log_test("Create Day Off Request", False, f"Failed to create day off request: {error_msg}")
        
        # Get employee's own requests
        response = self.make_request("GET", "/schedule-requests", token=self.employee_token)
        if response and response.status_code == 200:
            requests = response.json()
            if isinstance(requests, list) and len(requests) >= 1:
                self.log_test("Get Employee Requests", True, f"Employee retrieved {len(requests)} requests")
            else:
                self.log_test("Get Employee Requests", False, "No requests found for employee")
        else:
            self.log_test("Get Employee Requests", False, "Failed to get employee requests")
        
        # Get pending requests (coordinator)
        response = self.make_request("GET", "/pending-requests", token=self.coordinator_token)
        if response and response.status_code == 200:
            pending = response.json()
            if isinstance(pending, list):
                self.log_test("Get Pending Requests", True, f"Coordinator retrieved {len(pending)} pending requests")
            else:
                self.log_test("Get Pending Requests", False, "Unexpected pending requests data")
        else:
            self.log_test("Get Pending Requests", False, "Failed to get pending requests")
        
        # Respond to request (coordinator)
        response_data = {
            "request_id": request_id,
            "status": "approved",
            "response": "Request approved for schedule change"
        }
        
        response = self.make_request("PUT", f"/schedule-requests/{request_id}/respond", 
                                   token=self.coordinator_token, data=response_data)
        if response and response.status_code == 200:
            updated_request = response.json()
            if updated_request.get("status") == "approved":
                self.log_test("Respond to Request", True, "Request approved successfully")
            else:
                self.log_test("Respond to Request", False, "Request status not updated")
        else:
            error_msg = response.text if response else "No response"
            self.log_test("Respond to Request", False, f"Failed to respond to request: {error_msg}")
        
        # Test employee trying to respond to request (should fail)
        response = self.make_request("PUT", f"/schedule-requests/{request_id}/respond", 
                                   token=self.employee_token, data=response_data)
        if response and response.status_code == 403:
            self.log_test("Request Response Access Control", True, "Employee correctly denied request response")
        else:
            self.log_test("Request Response Access Control", False, "Employee should not respond to requests")
    
    def test_excel_functionality(self):
        """Test Excel import/export functionality"""
        print("\n=== Testing Excel Import/Export ===")
        
        # Test template download
        response = self.make_request("GET", "/download-template", token=self.admin_token)
        if response and response.status_code == 200:
            content_type = response.headers.get('content-type', '')
            if 'spreadsheet' in content_type or 'excel' in content_type:
                self.log_test("Download Template", True, "Excel template downloaded successfully")
            else:
                self.log_test("Download Template", False, f"Unexpected content type: {content_type}")
        else:
            self.log_test("Download Template", False, "Failed to download template")
        
        # Test export schedules
        response = self.make_request("GET", "/export-schedules", token=self.admin_token)
        if response and response.status_code == 200:
            content_type = response.headers.get('content-type', '')
            if 'spreadsheet' in content_type or 'excel' in content_type:
                self.log_test("Export Schedules", True, "Schedules exported successfully")
            else:
                self.log_test("Export Schedules", False, f"Unexpected content type: {content_type}")
        else:
            self.log_test("Export Schedules", False, "Failed to export schedules")
        
        # Test employee trying to download template (should fail)
        response = self.make_request("GET", "/download-template", token=self.employee_token)
        if response and response.status_code == 403:
            self.log_test("Excel Access Control", True, "Employee correctly denied template access")
        else:
            self.log_test("Excel Access Control", False, "Employee should not access Excel functions")
    
    def test_configuration_management(self):
        """Test configuration management"""
        print("\n=== Testing Configuration Management ===")
        
        # Get configuration
        response = self.make_request("GET", "/configuration")
        if response and response.status_code == 200:
            config = response.json()
            if "background_color" in config:
                self.log_test("Get Configuration", True, f"Configuration retrieved: {config['background_color']}")
            else:
                self.log_test("Get Configuration", False, "Missing background_color in configuration")
        else:
            self.log_test("Get Configuration", False, "Failed to get configuration")
        
        # Update configuration (admin)
        new_config = {
            "id": str(uuid.uuid4()),
            "background_color": "#f0f0f0"
        }
        
        response = self.make_request("PUT", "/configuration", token=self.admin_token, data=new_config)
        if response and response.status_code == 200:
            updated_config = response.json()
            if updated_config.get("background_color") == "#f0f0f0":
                self.log_test("Update Configuration", True, "Configuration updated successfully")
            else:
                self.log_test("Update Configuration", False, "Configuration not properly updated")
        else:
            error_msg = response.text if response else "No response"
            self.log_test("Update Configuration", False, f"Failed to update configuration: {error_msg}")
        
        # Test employee trying to update configuration (should fail)
        response = self.make_request("PUT", "/configuration", token=self.employee_token, data=new_config)
        if response and response.status_code == 403:
            self.log_test("Configuration Access Control", True, "Employee correctly denied configuration update")
        else:
            self.log_test("Configuration Access Control", False, "Employee should not update configuration")
    
    def test_services_endpoint(self):
        """Test services endpoint"""
        print("\n=== Testing Services Endpoint ===")
        
        response = self.make_request("GET", "/services", token=self.admin_token)
        if response and response.status_code == 200:
            services_data = response.json()
            if "services" in services_data and isinstance(services_data["services"], list):
                self.log_test("Get Services", True, f"Retrieved {len(services_data['services'])} services")
            else:
                self.log_test("Get Services", False, "Unexpected services data format")
        else:
            self.log_test("Get Services", False, "Failed to get services")
    
    def run_all_tests(self):
        """Run all backend tests"""
        print("🚀 Starting Comprehensive Backend API Testing")
        print(f"Backend URL: {self.base_url}")
        
        # Run tests in order
        if not self.test_admin_initialization():
            print("❌ Admin initialization failed - stopping tests")
            return
        
        if not self.test_authentication():
            print("❌ Authentication failed - stopping tests")
            return
        
        self.test_user_management()
        self.test_schedule_management()
        self.test_schedule_requests()
        self.test_excel_functionality()
        self.test_configuration_management()
        self.test_services_endpoint()
        
        # Print summary
        print("\n" + "="*60)
        print("📊 TEST SUMMARY")
        print("="*60)
        
        passed = sum(1 for result in self.test_results if "✅" in result["status"])
        failed = sum(1 for result in self.test_results if "❌" in result["status"])
        
        print(f"Total Tests: {len(self.test_results)}")
        print(f"Passed: {passed}")
        print(f"Failed: {failed}")
        
        if failed > 0:
            print("\n❌ FAILED TESTS:")
            for result in self.test_results:
                if "❌" in result["status"]:
                    print(f"  - {result['test']}: {result['message']}")
        
        print(f"\n{'🎉 ALL TESTS PASSED!' if failed == 0 else '⚠️  SOME TESTS FAILED'}")
        
        return failed == 0

if __name__ == "__main__":
    tester = ScheduleAPITester()
    success = tester.run_all_tests()
    exit(0 if success else 1)