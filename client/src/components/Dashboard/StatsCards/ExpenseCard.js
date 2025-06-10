import React from 'react';
import { Card, Typography } from 'antd';
import { ArrowDownOutlined } from '@ant-design/icons';


const { Text, Title } = Typography;


const ExpenseCard = ({ totalExpenses }) => {
  return (
    <Card bordered={false} className="stats-card expense-card">
      <div className="card-content">
        <Text type="secondary" className="card-title">Total Expenses</Text>
        <Title level={3} className="card-value">
          ${totalExpenses?.toFixed(2) || '0.00'}
        </Title>
        <div className="card-change">
          <ArrowDownOutlined style={{ color: '#f5222d' }} />
          <Text type="danger" className="card-percentage">Expenses</Text>
        </div>
      </div>
    </Card>
  );
};


export default ExpenseCard;
