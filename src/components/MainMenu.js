import React from 'react';
import { Menu } from 'antd';
import { UserOutlined, LaptopOutlined, NotificationOutlined } from '@ant-design/icons';
import { useActor } from '@xstate/react';

const { SubMenu } = Menu;

export const MainMenu = ({ actor }) => {
    const [appState, send] = useActor(actor);

    return (
        <Menu
            mode="inline"
            defaultOpenKeys={["messaging"]}
            style={{ height: "100%", borderRight: 0 }}
        >
            <SubMenu key="messaging" icon={<NotificationOutlined />} title="SMS Task">
                <Menu.Item key="send_sms" onClick={() => send({ type: 'NAV_SEND_SMS' })}>Send SMS</Menu.Item>
                <Menu.Item key="task_report" onClick={() => send({ type: 'NAV_TASK_REPORT' })}>Task Report</Menu.Item>
            </SubMenu>
            <SubMenu key="inventory" icon={<UserOutlined />} title="Inventory">
                <Menu.Item key="purchase_package" onClick={() => send({ type: 'NAV_PURCHASE_PACKAGE' })}>Purchase Package</Menu.Item>
                <Menu.Item key="order_history" onClick={() => send({ type: 'NAV_ORDER_HISTORY' })}>Purchase/Order History</Menu.Item>
                <Menu.Item key="active_packages" onClick={() => send({ type: 'NAV_ACTIVE_PACKAGES' })}>Active Packages</Menu.Item>
            </SubMenu>
            <SubMenu key="balance" icon={<LaptopOutlined />} title="Balance & Topup">
                <Menu.Item key="cash_deposit" onClick={() => send({ type: 'NAV_CASH_DEPOSIT' })}>Cash Deposit</Menu.Item>
                <Menu.Item key="transaction_view" onClick={() => send({ type: 'NAV_TRANSACTION_VIEW' })}>Transaction View</Menu.Item>
                <Menu.Item key="current_balance" onClick={() => send({ type: 'NAV_CURRENT_BALANCE' })}>Current Balance</Menu.Item>
            </SubMenu>
        </Menu>
    );
};
