# Step 1: Setup Core Services and Mock API

**Commit**: "feat: implement map service with mock API endpoints"

## Overview
This step establishes the foundation of our ticket booking application by implementing the core infrastructure, domain models, and mock API service following Domain Driven Design principles.

## What Was Implemented

### 1. HTTP Client Module Setup
**File**: `src/app/app.module.ts`
- Added `HttpClientModule` import and registration
- This enables HTTP communication for our API service

### 2. Domain Models
**File**: `src/app/models/index.ts`
- **Coordinates Interface**: Represents x,y positions in the seat map
- **SeatStatus Enum**: Defines seat states (AVAILABLE=0, RESERVED=1, SELECTED=2)
- **Seat Interface**: Single seat entity with coordinates and status
- **SeatMap Interface**: Complete stadium map with 2D seat array
- **TicketPurchaseRequest/Response**: API contract for ticket purchasing
- **Stadium Interface**: Stadium entity information

### 3. Mock API Service
**File**: `src/app/services/map.service.ts`
- **MapService**: Core service implementing all required API endpoints
- **GET /map**: Returns list of map IDs with mock data
- **GET /map/<id>**: Returns 2D seat array with configurable sizes
- **POST /map/<id>/ticket**: Simulates ticket purchase with 90% success rate
- **getRandomMapId()**: Utility method to select random stadium
- **Performance Testing Support**: Generates large maps up to 105k seats (m6888)

### 4. Routing Configuration
**File**: `src/app/app-routing.module.ts`
- Setup routes for navigation between components:
  - `/salons` → SalonsListComponent
  - `/plan/:mapId` → PlanComponent (with map ID parameter)
  - Default redirect to `/salons`
  - Wildcard route for 404 handling

**File**: `src/app/app.component.html`
- Replaced direct component usage with `<router-outlet>`
- Enables proper routing between views

## Technical Decisions

### Domain Driven Design Implementation
- **Entities**: Clear separation of Stadium, Seat, SeatMap as core business entities
- **Value Objects**: Coordinates as immutable value object
- **Services**: MapService acts as Repository pattern for data access
- **Interfaces**: Strong typing for all API contracts

### Mock API Strategy
- **Fallback Design**: Service can switch between real API and mock data
- **Realistic Simulation**: Network delays, success/failure rates
- **Performance Testing**: Different map sizes for testing scalability
- **Error Handling**: Built-in retry logic and error scenarios

### Map Size Configurations
```typescript
'm213': 20x30 (600 seats) - Small stadium
'm654': 50x80 (4,000 seats) - Medium stadium  
'm63': 100x200 (20,000 seats) - Large stadium
'm6888': 300x350 (105,000 seats) - Very large for performance testing
```

## Architecture Benefits

1. **Scalability**: Service design supports real API integration without code changes
2. **Testability**: Mock data enables development without backend dependency
3. **Performance**: Large map generation for testing optimization requirements
4. **Maintainability**: Clear separation of concerns with DDD patterns
5. **Type Safety**: Full TypeScript typing for compile-time error detection

## Next Steps
With the core infrastructure in place, we can now:
- Implement the stadium list component to fetch and display available stadiums
- Build the seat map visualization using the mock data
- Test performance with the large map configurations
- Add user interactions for seat selection

## Files Created/Modified
- ✅ `src/app/app.module.ts` - Added HttpClientModule
- ✅ `src/app/models/index.ts` - Domain models and interfaces
- ✅ `src/app/services/map.service.ts` - Core API service with mocks
- ✅ `src/app/app-routing.module.ts` - Routing configuration
- ✅ `src/app/app.component.html` - Router outlet setup

## Verification
The foundation is ready when:
- ✅ TypeScript compiles without errors
- ✅ No linting errors in new files
- ✅ Routes are configured and accessible
- ✅ Mock service generates various map sizes
- ✅ All API endpoints return expected data structures
