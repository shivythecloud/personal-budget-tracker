import React from 'react';
import { Card, Typography } from 'antd';
import { DollarOutlined } from '@ant-design/icons';


const { Text, Title } = Typography;


const BalanceCard = ({ balance }) => {
  const isPositive = balance >= 0;
  
  return (
    <Card bordered={false} className="stats-card balance-card">
      <div className="card-content">
        <Text type="secondary" className="card-title">Current Balance</Text>
        <Title level={3} className="card-value" style={{ color: isPositive ? '#52c41a' : '#f5222d' }}>
          ${balance?.toFixed(2) || '0.00'}
        </Title>
        <div className="card-change">
          <DollarOutlined style={{ color: isPositive ? '#52c41a' : '#f5222d' }} />
          <Text type={isPositive ? 'success' : 'danger'} className="card-percentage">
            {isPositive ? 'Positive' : 'Negative'}
          </Text>
        </div>
      </div>
    </Card>
  );
};


export default BalanceCard;
