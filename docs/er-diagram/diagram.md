# Entity-Relationship Model
Entity-Relationship (ER) 
**TripSplit** 

---

## Entity-Relationship Diagram (Mermaid)

```mermaid
erDiagram
    users {
        int id PK
        string name
        string email UK
        string password_hash
        timestamp created_at
    }

    trips {
        int id PK
        string name
        string destination
        date start_date
        date end_date
        decimal total_budget
        int organizer_id FK
        char invite_code UK
        timestamp created_at
    }

    trip_participants {
        int id PK
        int trip_id FK
        int user_id FK
        enum role
        timestamp joined_at
    }

    activities {
        int id PK
        int trip_id FK
        string title
        string description
        string location
        date date
        time time
        int created_by FK
    }

    expenses {
        int id PK
        int trip_id FK
        string description
        decimal amount
        enum category
        date date
        int paid_by FK
        timestamp created_at
    }

    expense_participants {
        int id PK
        int expense_id FK
        int user_id FK
        decimal assigned_amount
    }

    payments {
        int id PK
        int trip_id FK
        int from_user_id FK
        int to_user_id FK
        decimal amount
        date date
    }

    luggage_items {
        int id PK
        int trip_id FK
        string name
        boolean is_checked
        int assigned_to FK
        int created_by FK
    }

    users ||--o{ trips : "organizes"
    users ||--o{ trip_participants : "participates in"
    trips ||--o{ trip_participants : "has participants"
    trips ||--o{ activities : "contains"
    trips ||--o{ expenses : "has"
    users ||--o{ expenses : "pays"
    expenses ||--o{ expense_participants : "split among"
    users ||--o{ expense_participants : "involved in"
    trips ||--o{ payments : "records"
    users ||--o{ payments : "sends"
    users ||--o{ payments : "receives"
    trips ||--o{ luggage_items : "requires"
    users ||--o{ luggage_items : "assigned to"

```
