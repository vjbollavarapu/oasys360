import pytest
from httpx import AsyncClient, ASGITransport
from main import app

@pytest.fixture(scope="session")
def anyio_backend():
    return "asyncio"

import pytest_asyncio

@pytest_asyncio.fixture
async def client():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as c:
        yield c
