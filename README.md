# Expense Tracker

A full-featured expense tracking application with both command-line and web interfaces built with Python and Flask.

## Features

- **Add Expenses**: Record expenses with amount, category, description, and date
- **View All Expenses**: Display all expenses in a formatted table
- **Category Summary**: View total expenses grouped by category
- **Search by Category**: Filter expenses by specific category
- **Update Expenses**: Modify existing expense entries
- **Delete Expenses**: Remove unwanted expense records
- **Data Persistence**: Automatically saves all data to JSON file
- **Web Interface**: Modern, responsive web UI
- **CLI Interface**: Traditional command-line interface

## Installation

1. Make sure you have Python 3.6 or higher installed
2. Clone or download this repository
3. Install dependencies:

```bash
pip install -r requirements.txt
```

## Usage

### Web Interface (Recommended)

Run the web application:

```bash
python app.py
```

Then open your browser and go to: **http://localhost:5000**

The web interface includes:
- Real-time expense tracking
- Interactive charts and summaries
- Search and filter functionality
- Mobile-responsive design

### Command-Line Interface

Run the CLI application:

```bash
python main.py
```

Or make it executable:

```bash
chmod +x main.py
./main.py
```

## Menu Options

1. **Add Expense**: Add a new expense entry
2. **View All Expenses**: Display all recorded expenses
3. **View Summary by Category**: See total spending per category
4. **Search by Category**: Filter and view expenses by category
5. **Update Expense**: Modify an existing expense
6. **Delete Expense**: Remove an expense record
7. **Exit**: Close the application

## File Structure

```
expense_tracker/
├── app.py                  # Flask web application
├── main.py                 # CLI interface
├── expense.py              # Expense class definition
├── expense_manager.py      # Business logic and data management
├── requirements.txt        # Python dependencies
├── expenses.json           # Data storage (created automatically)
├── templates/
│   └── index.html         # Web interface HTML
└── static/
    ├── css/
    │   └── style.css      # Styles
    └── js/
        └── app.js         # Frontend JavaScript
```

## Example Usage

### Adding an Expense
```
Enter amount: $45.50
Enter category: Food
Enter description: Lunch at restaurant
Enter date (YYYY-MM-DD) or press Enter for today:
```

### Viewing Summary
```
Category              Total
-----------------------------------
Food                  $245.50
Transport             $120.00
Entertainment         $89.99
-----------------------------------
TOTAL                 $455.49
```

## Data Storage

All expenses are stored in `expenses.json` in the same directory as the application. The data persists between sessions.

## License

Free to use and modify.
