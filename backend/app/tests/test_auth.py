import pytest
from unittest.mock import MagicMock, patch
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

@patch("app.crud.supabase")
def test_register_and_login(mock_supabase):
    # Setup mock behaviors
    users_db = {}

    def mock_table(table_name):
        table_mock = MagicMock()
        
        if table_name == "users":
            # Mock select
            select_mock = MagicMock()
            table_mock.select.return_value = select_mock
            
            eq_mock = MagicMock()
            select_mock.eq.return_value = eq_mock
            
            def execute_select():
                username = select_mock.eq.call_args[0][1] if select_mock.eq.call_args else None
                user = users_db.get(username)
                res = MagicMock()
                res.data = [user] if user else []
                return res
            eq_mock.execute.side_effect = execute_select
            
            # Mock insert
            def execute_insert():
                insert_data = table_mock.insert.call_args[0][0]
                username = insert_data["username"]
                import uuid
                from datetime import datetime
                new_user = {
                    "id": str(uuid.uuid4()),
                    "username": username,
                    "password_hash": insert_data["password_hash"],
                    "created_at": datetime.utcnow().isoformat()
                }
                users_db[username] = new_user
                res = MagicMock()
                res.data = [new_user]
                return res
            
            insert_mock = MagicMock()
            table_mock.insert.return_value = insert_mock
            insert_mock.execute.side_effect = execute_insert
            
        return table_mock

    mock_supabase.table.side_effect = mock_table

    unique_username = "mockuser123"
    payload = {
        "username": unique_username,
        "password": "testpassword123"
    }
    
    # 1. Register user
    response = client.post("/api/auth/register", json=payload)
    assert response.status_code == 200, f"Registration failed: {response.text}"
    data = response.json()
    assert "access_token" in data
    assert data["user"]["username"] == unique_username
    
    # 2. Try registering the same username again
    response_duplicate = client.post("/api/auth/register", json=payload)
    assert response_duplicate.status_code == 400
    
    # 3. Login with correct credentials
    response_login = client.post("/api/auth/login", json=payload)
    assert response_login.status_code == 200
    login_data = response_login.json()
    assert "access_token" in login_data
    assert login_data["user"]["username"] == unique_username
    
    # 4. Login with incorrect password
    bad_payload = {
        "username": unique_username,
        "password": "wrongpassword"
    }
    response_bad_login = client.post("/api/auth/login", json=bad_payload)
    assert response_bad_login.status_code == 401
