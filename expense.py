"""
Expense class to represent individual expense entries
"""
from datetime import datetime
from typing import Optional


class Expense:
    def __init__(
        self,
        amount: float,
        category: str,
        description: str,
        date: Optional[str] = None,
        expense_id: Optional[int] = None
    ):
        self.expense_id = expense_id
        self.amount = amount
        self.category = category
        self.description = description
        self.date = date or datetime.now().strftime("%Y-%m-%d")

    def to_dict(self):
        """Convert expense to dictionary for JSON serialization"""
        return {
            "id": self.expense_id,
            "amount": self.amount,
            "category": self.category,
            "description": self.description,
            "date": self.date
        }

    @classmethod
    def from_dict(cls, data: dict):
        """Create Expense object from dictionary"""
        return cls(
            amount=data["amount"],
            category=data["category"],
            description=data["description"],
            date=data.get("date"),
            expense_id=data.get("id")
        )

    def __str__(self):
        return f"[{self.date}] ${self.amount:.2f} - {self.category}: {self.description}"
