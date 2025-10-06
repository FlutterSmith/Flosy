#!/usr/bin/env python3
"""
Expense Tracker Web Application
Flask-based web interface for the expense tracker
"""
from flask import Flask, render_template, request, jsonify, redirect, url_for
from expense_manager import ExpenseManager
from datetime import datetime

app = Flask(__name__)
manager = ExpenseManager()


@app.route('/')
def index():
    """Main page"""
    return render_template('index.html')


@app.route('/api/expenses', methods=['GET'])
def get_expenses():
    """Get all expenses"""
    expenses = manager.get_all_expenses()
    return jsonify([exp.to_dict() for exp in expenses])


@app.route('/api/expenses', methods=['POST'])
def add_expense():
    """Add a new expense"""
    data = request.json
    try:
        expense = manager.add_expense(
            amount=float(data['amount']),
            category=data['category'],
            description=data['description'],
            date=data.get('date')
        )
        return jsonify({'success': True, 'expense': expense.to_dict()}), 201
    except (KeyError, ValueError) as e:
        return jsonify({'success': False, 'error': str(e)}), 400


@app.route('/api/expenses/<int:expense_id>', methods=['PUT'])
def update_expense(expense_id):
    """Update an existing expense"""
    data = request.json
    try:
        success = manager.update_expense(
            expense_id=expense_id,
            amount=float(data['amount']) if 'amount' in data else None,
            category=data.get('category'),
            description=data.get('description'),
            date=data.get('date')
        )
        if success:
            expense = manager.get_expense_by_id(expense_id)
            return jsonify({'success': True, 'expense': expense.to_dict()})
        else:
            return jsonify({'success': False, 'error': 'Expense not found'}), 404
    except (ValueError, KeyError) as e:
        return jsonify({'success': False, 'error': str(e)}), 400


@app.route('/api/expenses/<int:expense_id>', methods=['DELETE'])
def delete_expense(expense_id):
    """Delete an expense"""
    success = manager.delete_expense(expense_id)
    if success:
        return jsonify({'success': True})
    else:
        return jsonify({'success': False, 'error': 'Expense not found'}), 404


@app.route('/api/summary', methods=['GET'])
def get_summary():
    """Get expense summary by category"""
    summary = manager.get_summary_by_category()
    total = manager.get_total()
    return jsonify({
        'summary': summary,
        'total': total
    })


@app.route('/api/categories', methods=['GET'])
def get_categories():
    """Get list of all categories"""
    categories = manager.get_categories()
    return jsonify(categories)


if __name__ == '__main__':
    print("Starting Expense Tracker Web Application...")
    print("Open your browser and go to: http://localhost:5000")
    app.run(debug=True, host='0.0.0.0', port=5000)
