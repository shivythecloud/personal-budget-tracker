import React, { useState } from 'react';
import { Row, Col, Spin, Button, Space } from 'antd';
import { FilterOutlined } from '@ant-design/icons';
import CategoryFilter from './CategoryFilter';
import DateRangeFilter from './DateRangeFilter';
import TransactionList from './TransactionList';
import IncomeCard from './StatsCards/IncomeCard';
import ExpenseCard from './StatsCards/ExpenseCard';
import BalanceCard from './StatsCards/BalanceCard';
import { useTransactionContext } from '../context/TransactionContext';
import { useCategoryContext } from '../context/CategoryContext';


// Style constants
const styles = {
  container: {
    padding: '20px',
    maxWidth: '1200px',
    margin: '0 auto'
  },
  statsRow: {
    marginBottom: '24px'
  },
  transactionSection: {
    marginTop: '24px',
    backgroundColor: '#fff',
    padding: '24px',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  filterHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px'
  },
  filterRow: {
    display: 'flex',
    gap: '16px',
    flexWrap: 'wrap'
  },
  filterControl: {
    flex: '1 1 200px'
  }
};


const DashboardView = () => {
  // Filter states
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [dateRange, setDateRange] = useState(null);
  
  // Data contexts
  const { transactions, loading: transactionsLoading } = useTransactionContext();
  const { categories, loading: categoriesLoading } = useCategoryContext();


  // Reset all filters
  const handleResetFilters = () => {
    setSelectedCategory(null);
    setDateRange(null);
  };


  // Filter transactions
  const filteredTransactions = transactions.filter(t => {
    // Category filter
    const categoryMatch = selectedCategory ? t.category === selectedCategory : true;
    
    // Date filter
    let dateMatch = true;
    if (dateRange && dateRange[0] && dateRange[1]) {
      const transactionDate = new Date(t.date);
      dateMatch = transactionDate >= dateRange[0] && transactionDate <= dateRange[1];
    }
    
    return categoryMatch && dateMatch;
  });


  // Calculate totals
  const incomeTotal = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);


  const expenseTotal = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);


  const balance = incomeTotal - expenseTotal;


  // Check if any filter is active
  const filtersActive = selectedCategory || (dateRange && dateRange.some(Boolean));


  return (
    <div style={styles.container}>
      {/* Stats Cards Row */}
      <Row gutter={16} style={styles.statsRow}>
        <Col xs={24} sm={12} lg={8}>
          <IncomeCard totalIncome={incomeTotal} />
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <ExpenseCard totalExpenses={expenseTotal} />
        </Col>
        <Col xs={24} sm={24} lg={8}>
          <BalanceCard balance={balance} />
        </Col>
      </Row>


      {/* Transactions Section */}
      <Spin spinning={transactionsLoading || categoriesLoading}>
        <div style={styles.transactionSection}>
          {/* Filter Header */}
          <div style={styles.filterHeader}>
            <h3 style={{ margin: 0 }}>Transactions</h3>
            {filtersActive && (
              <Button 
                icon={<FilterOutlined />}
                onClick={handleResetFilters}
                size="small"
              >
                Reset Filters
              </Button>
            )}
          </div>


          {/* Filter Controls */}
          <div style={styles.filterRow}>
            <div style={styles.filterControl}>
              <CategoryFilter 
                categories={categories} 
                onCategoryChange={setSelectedCategory}
                value={selectedCategory}
                loading={categoriesLoading}
              />
            </div>
            <div style={styles.filterControl}>
              <DateRangeFilter 
                onChange={setDateRange}
                value={dateRange}
              />
            </div>
          </div>


          {/* Transaction List */}
          <TransactionList 
            transactions={filteredTransactions} 
            loading={transactionsLoading}
          />
        </div>
      </Spin>
    </div>
  );
};


export default DashboardView;
