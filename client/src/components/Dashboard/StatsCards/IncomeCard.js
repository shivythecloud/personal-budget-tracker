import React from 'react';
import { Card, Typography } from 'antd';
import { ArrowUpOutlined } from '@ant-design/icons';


const { Text, Title } = Typography;


const IncomeCard = ({ totalIncome }) => {
  return (
    <Card bordered={false} className="stats-card income-card">
      <div className="card-content">
        <Text type="secondary" className="card-title">Total Income</Text>
        <Title level={3} className="card-value">
          ${totalIncome?.toFixed(2) || '0.00'}
        </Title>
        <div className="card-change">
          <ArrowUpOutlined style={{ color: '#52c41a' }} />
          <Text type="success" className="card-percentage">Income</Text>
        </div>
      </div>
    </Card>
  );
};


export default IncomeCard;
