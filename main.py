#!/usr/bin/env python3
"""
Expense Tracker - A simple CLI application to track your expenses
"""
import sys
from datetime import datetime
from expense_manager import ExpenseManager


def print_header(text):
    """Print a formatted header"""
    print("\n" + "=" * 60)
    print(f" {text}")
    print("=" * 60)


def print_expenses(expenses):
    """Print a list of expenses in a formatted table"""
    if not expenses:
        print("No expenses found.")
        return

    print("\n{:<5} {:<12} {:<10} {:<15} {}".format("ID", "Date", "Amount", "Category", "Description"))
    print("-" * 80)
    for expense in expenses:
        print("{:<5} {:<12} ${:<9.2f} {:<15} {}".format(
            expense.expense_id,
            expense.date,
            expense.amount,
            expense.category,
            expense.description
        ))


def add_expense_interactive(manager):
    """Interactive flow to add a new expense"""
    print_header("Add New Expense")

    try:
        amount = float(input("Enter amount: $"))
        category = input("Enter category (e.g., Food, Transport, Entertainment): ").strip()
        description = input("Enter description: ").strip()
        date_input = input("Enter date (YYYY-MM-DD) or press Enter for today: ").strip()

        date = date_input if date_input else None

        expense = manager.add_expense(amount, category, description, date)
        print(f"\n✓ Expense added successfully! (ID: {expense.expense_id})")

    except ValueError:
        print("Error: Invalid amount. Please enter a valid number.")


def view_expenses(manager):
    """View all expenses"""
    print_header("All Expenses")
    expenses = manager.get_all_expenses()
    print_expenses(expenses)

    total = manager.get_total()
    print(f"\nTotal Expenses: ${total:.2f}")


def view_summary(manager):
    """View expense summary by category"""
    print_header("Expense Summary by Category")
    summary = manager.get_summary_by_category()

    if not summary:
        print("No expenses found.")
        return

    print("\n{:<20} {:<15}".format("Category", "Total"))
    print("-" * 35)

    for category, total in sorted(summary.items()):
        print("{:<20} ${:<14.2f}".format(category, total))

    overall_total = manager.get_total()
    print("-" * 35)
    print("{:<20} ${:<14.2f}".format("TOTAL", overall_total))


def delete_expense_interactive(manager):
    """Interactive flow to delete an expense"""
    print_header("Delete Expense")

    try:
        expense_id = int(input("Enter expense ID to delete: "))
        expense = manager.get_expense_by_id(expense_id)

        if expense:
            print(f"\nExpense to delete: {expense}")
            confirm = input("Are you sure you want to delete this expense? (yes/no): ").lower()

            if confirm in ['yes', 'y']:
                manager.delete_expense(expense_id)
                print("✓ Expense deleted successfully!")
            else:
                print("Deletion cancelled.")
        else:
            print(f"Error: No expense found with ID {expense_id}")

    except ValueError:
        print("Error: Invalid ID. Please enter a valid number.")


def update_expense_interactive(manager):
    """Interactive flow to update an expense"""
    print_header("Update Expense")

    try:
        expense_id = int(input("Enter expense ID to update: "))
        expense = manager.get_expense_by_id(expense_id)

        if not expense:
            print(f"Error: No expense found with ID {expense_id}")
            return

        print(f"\nCurrent expense: {expense}")
        print("\nEnter new values (press Enter to keep current value):")

        amount_input = input(f"Amount (${expense.amount:.2f}): ").strip()
        category_input = input(f"Category ({expense.category}): ").strip()
        description_input = input(f"Description ({expense.description}): ").strip()
        date_input = input(f"Date ({expense.date}): ").strip()

        amount = float(amount_input) if amount_input else None
        category = category_input if category_input else None
        description = description_input if description_input else None
        date = date_input if date_input else None

        manager.update_expense(expense_id, amount, category, description, date)
        print("✓ Expense updated successfully!")

    except ValueError:
        print("Error: Invalid input.")


def search_by_category(manager):
    """Search expenses by category"""
    print_header("Search by Category")

    categories = manager.get_categories()
    if categories:
        print("\nAvailable categories:", ", ".join(categories))

    category = input("\nEnter category to search: ").strip()
    expenses = manager.get_expenses_by_category(category)

    print(f"\nExpenses in category '{category}':")
    print_expenses(expenses)

    total = manager.get_total(category)
    print(f"\nTotal for {category}: ${total:.2f}")


def print_menu():
    """Print the main menu"""
    print("\n" + "=" * 60)
    print(" EXPENSE TRACKER")
    print("=" * 60)
    print("1. Add Expense")
    print("2. View All Expenses")
    print("3. View Summary by Category")
    print("4. Search by Category")
    print("5. Update Expense")
    print("6. Delete Expense")
    print("7. Exit")
    print("=" * 60)


def main():
    """Main application loop"""
    manager = ExpenseManager()

    while True:
        print_menu()
        choice = input("\nEnter your choice (1-7): ").strip()

        if choice == '1':
            add_expense_interactive(manager)
        elif choice == '2':
            view_expenses(manager)
        elif choice == '3':
            view_summary(manager)
        elif choice == '4':
            search_by_category(manager)
        elif choice == '5':
            update_expense_interactive(manager)
        elif choice == '6':
            delete_expense_interactive(manager)
        elif choice == '7':
            print("\nThank you for using Expense Tracker!")
            sys.exit(0)
        else:
            print("\nInvalid choice. Please enter a number between 1 and 7.")


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\nExiting Expense Tracker...")
        sys.exit(0)
