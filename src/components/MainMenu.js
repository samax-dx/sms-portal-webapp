import React from 'react';
import { useActor } from '@xstate/react';
import { Menu } from 'antd';

import { MailOutlined, CreditCardOutlined, AuditOutlined, DatabaseOutlined, ReconciliationTwoTone, DatabaseTwoTone, ReconciliationOutlined, ReconciliationFilled, DatabaseFilled, ShoppingTwoTone, MailFilled, FileTextFilled, MailTwoTone, FileTextOutlined, SendOutlined, FileTextTwoTone, RocketTwoTone, InfoCircleTwoTone, HddTwoTone } from '@ant-design/icons';
import * as PropTypes from "prop-types";
import {Link} from "react-router-dom";


export const MainMenu = ({ actor }) => {
    const [appState, sendApp] = [actor.getSnapshot(), actor.send];

    return (
        <Menu
            mode="inline"
            defaultOpenKeys={["messaging"]}
            style={{ height: "100%", borderRight: 0 }}
            selectedKeys={[appState.value]}
        >
            <Menu.SubMenu key="messaging" icon={<MailOutlined />} title="SMS Task">
                {/*<Menu.Item key="sendSMS" icon={<RocketTwoTone />} onClick={() => sendApp({ type: 'NAV_SEND_SMS' })}>Send SMS</Menu.Item>*/}
                <Menu.Item key="sendSms" icon={<FileTextTwoTone />}><Link to={"/sendSms"}>Send SMS</Link></Menu.Item>
                {/*<Menu.Item key="campaign" icon={<FileTextTwoTone />} onClick={() => sendApp({ type: 'NAV_CAMPAIGN' })}>Campaigns</Menu.Item>*/}
                <Menu.Item icon={<FileTextTwoTone />}><Link to={"/campaign"}>Campaigns</Link></Menu.Item>
                {/*<Menu.Item key="campaignTaskReport" icon={<InfoCircleTwoTone />} onClick={() => sendApp({ type: 'NAV_CAMPAIGN_TASK_REPORT' })}>SMS History</Menu.Item>*/}
                <Menu.Item icon={<InfoCircleTwoTone />}><Link to={"/smsHistory"}>SMS History</Link></Menu.Item>
            </Menu.SubMenu>
            <Menu.SubMenu key="order" icon={<DatabaseFilled />} title="Orders">
                {/*<Menu.Item key="buyPackage" icon={<ShoppingTwoTone />} onClick={() => sendApp({ type: 'NAV_BUY_PACKAGE' })}>Buy Package</Menu.Item>*/}
                <Menu.Item icon={<ShoppingTwoTone />}> <Link to={"/buyPackage"}>Buy Package</Link></Menu.Item>
                {/*<Menu.Item key="orders" icon={<ReconciliationTwoTone />} onClick={() => sendApp({ type: 'NAV_ORDERS' })}>Order History</Menu.Item>*/}
                <Menu.Item icon={<ReconciliationTwoTone />} > <Link to={"/orderHistory"}>Order History</Link></Menu.Item>
                {/*<Menu.Item key="myPackage" icon={<HddTwoTone />} onClick={() => sendApp({ type: 'NAV_MY_PACKAGE' })}>My Packages</Menu.Item>*/}
                <Menu.Item icon={<HddTwoTone />} ><Link to={"/myPackage"}>My Packages</Link></Menu.Item>
            </Menu.SubMenu>
            <Menu.SubMenu key="balance" icon={<CreditCardOutlined />} title="Balance & Topup">
                <Menu.Item icon={<ReconciliationTwoTone />}><Link to="/paymentHistory">Payment History</Link></Menu.Item>
                {/*<Menu.Item key="myPayment" onClick={() => sendApp({ type: 'NAV_MY_PAYMENT' })}>Payment History</Menu.Item>*/}
                {/* <Menu.Item key="makeDeposit" onClick={() => sendApp({ type: 'NAV_MAKE_DEPOSIT' })} disabled>TopUp / Payments</Menu.Item>
                <Menu.Item key="transaction_view" onClick={() => sendApp({ type: 'NAV_TRANSACTION_VIEW' })} disabled>Transaction View</Menu.Item>
                <Menu.Item key="current_balance" onClick={() => sendApp({ type: 'NAV_CURRENT_BALANCE' })} disabled>Current Balance</Menu.Item> */}
            </Menu.SubMenu>
        </Menu>
    );
};
