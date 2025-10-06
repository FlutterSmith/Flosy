"""
ExpenseManager class to handle all expense operations and data persistence
"""
import json
import os
from typing import List, Optional
from expense import Expense


class ExpenseManager:
    def __init__(self, data_file: str = "expenses.json"):
        self.data_file = data_file
        self.expenses: List[Expense] = []
        self.next_id = 1
        self.load_expenses()

    def load_expenses(self):
        """Load expenses from JSON file"""
        if os.path.exists(self.data_file):
            try:
                with open(self.data_file, 'r') as f:
                    data = json.load(f)
                    self.expenses = [Expense.from_dict(exp) for exp in data]
                    if self.expenses:
                        self.next_id = max(exp.expense_id for exp in self.expenses) + 1
            except (json.JSONDecodeError, KeyError):
                print(f"Warning: Could not load data from {self.data_file}")
                self.expenses = []

    def save_expenses(self):
        """Save expenses to JSON file"""
        with open(self.data_file, 'w') as f:
            json.dump([exp.to_dict() for exp in self.expenses], f, indent=2)

    def add_expense(self, amount: float, category: str, description: str, date: Optional[str] = None) -> Expense:
        """Add a new expense"""
        expense = Expense(amount, category, description, date, self.next_id)
        self.expenses.append(expense)
        self.next_id += 1
        self.save_expenses()
        return expense

    def delete_expense(self, expense_id: int) -> bool:
        """Delete an expense by ID"""
        for i, expense in enumerate(self.expenses):
            if expense.expense_id == expense_id:
                self.expenses.pop(i)
                self.save_expenses()
                return True
        return False

    def update_expense(self, expense_id: int, amount: Optional[float] = None,
                      category: Optional[str] = None, description: Optional[str] = None,
                      date: Optional[str] = None) -> bool:
        """Update an existing expense"""
        for expense in self.expenses:
            if expense.expense_id == expense_id:
                if amount is not None:
                    expense.amount = amount
                if category is not None:
                    expense.category = category
                if description is not None:
                    expense.description = description
                if date is not None:
                    expense.date = date
                self.save_expenses()
                return True
        return False

    def get_all_expenses(self) -> List[Expense]:
        """Get all expenses"""
        return sorted(self.expenses, key=lambda x: x.date, reverse=True)

    def get_expense_by_id(self, expense_id: int) -> Optional[Expense]:
        """Get a specific expense by ID"""
        for expense in self.expenses:
            if expense.expense_id == expense_id:
                return expense
        return None

    def get_expenses_by_category(self, category: str) -> List[Expense]:
        """Get all expenses in a specific category"""
        return [exp for exp in self.expenses if exp.category.lower() == category.lower()]

    def get_total(self, category: Optional[str] = None) -> float:
        """Get total expenses, optionally filtered by category"""
        if category:
            expenses = self.get_expenses_by_category(category)
        else:
            expenses = self.expenses
        return sum(exp.amount for exp in expenses)

    def get_categories(self) -> List[str]:
        """Get list of unique categories"""
        return sorted(list(set(exp.category for exp in self.expenses)))

    def get_summary_by_category(self) -> dict:
        """Get expense summary grouped by category"""
        summary = {}
        for expense in self.expenses:
            if expense.category not in summary:
                summary[expense.category] = 0
            summary[expense.category] += expense.amount
        return summary
