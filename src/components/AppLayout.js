import React from 'react';
import { useActor } from '@xstate/react';
import { Col, Row, Layout, Breadcrumb } from 'antd';

import { TopMenu } from "./TopMenu";
import { MainMenu } from './MainMenu';
import getAllConfig from '../config/main'


const { Header, Sider } = Layout;

export const AppLayout = ({ render: PageContent, actor }) => {
    const [appState, sendApp] = [actor.getSnapshot(), actor.send];

    return [
        <Layout style={{ padding: "24px" }}>
            <PageContent actor={appState.context.actor} />
        </Layout>,
        <Layout>
            <Header className="header">
                <Row>
                    <Col xs={10} sm={4} className="logo" onClick={() => actor.send("NAV_HOME")}>
                        <img src={getAllConfig.logo} style={{ marginBottom: "4px" }} />
                        &nbsp;
                        <span>SMS-Portal Client</span>
                    </Col>
                    <Col xs={14} sm={20} className="menu"><TopMenu actor={actor} /></Col>
                </Row>
            </Header>
            <Layout>
                <Sider width={240} className="site-layout-background">
                    <MainMenu actor={actor} />
                </Sider>
                <Layout style={{ padding: "24px" }}>
                    <PageContent actor={appState.context.actor} />
                </Layout>
            </Layout>
        </Layout>
    ][appState.matches("login") ? 0 : 1];
};
