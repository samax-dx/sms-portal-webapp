import React from 'react';
import { useActor } from '@xstate/react';
import { Menu } from 'antd';

import { BarcodeOutlined, MailOutlined, ContainerOutlined, CreditCardOutlined } from '@ant-design/icons';

export const MainMenu = ({ actor }) => {
    const [appState, sendApp] = useActor(actor);

    return (
        <Menu
            mode="inline"
            defaultOpenKeys={["messaging"]}
            style={{ height: "100%", borderRight: 0 }}
            selectedKeys={[appState.value]}
        >
            <Menu.SubMenu key="messaging" icon={<MailOutlined />} title="SMS Task">
                <Menu.Item key="sendSMS" onClick={() => sendApp({ type: 'NAV_SEND_SMS' })}>Send SMS</Menu.Item>
                <Menu.Item key="smsReport" onClick={() => sendApp({ type: 'NAV_SMS_REPORT' })}>Task Report</Menu.Item>
            </Menu.SubMenu>
            <Menu.SubMenu key="order" icon={<ContainerOutlined />} title="Order Service">
                <Menu.Item key="orders" onClick={() => sendApp({ type: 'NAV_ORDERS' })}>Orders</Menu.Item>
            </Menu.SubMenu>
            <Menu.SubMenu key="inventory" icon={<BarcodeOutlined />} title="Inventory">
                <Menu.Item key="prducts" onClick={() => sendApp({ type: 'NAV_INVENTORY_PRODUCTS' })}>Products</Menu.Item>
            </Menu.SubMenu>
            <Menu.SubMenu key="balance" icon={<CreditCardOutlined />} title="Balance & Topup">
                <Menu.Item key="makeDeposit" onClick={() => sendApp({ type: 'NAV_MAKE_DEPOSIT' })}>TopUp / Payments</Menu.Item>
                <Menu.Item key="transaction_view" onClick={() => sendApp({ type: 'NAV_TRANSACTION_VIEW' })} disabled>Transaction View</Menu.Item>
                <Menu.Item key="current_balance" onClick={() => sendApp({ type: 'NAV_CURRENT_BALANCE' })} disabled>Current Balance</Menu.Item>
            </Menu.SubMenu>
        </Menu>
    );
};
