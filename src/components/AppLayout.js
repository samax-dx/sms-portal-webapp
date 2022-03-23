import React from 'react';
import { useActor } from '@xstate/react';
import { Col, Row, Layout, Breadcrumb } from 'antd';

import { TopMenu } from "./TopMenu";
import { MainMenu } from './MainMenu';


const { Header, Sider } = Layout;

export const AppLayout = ({ render: PageContent, actor }) => {
    const [appState, sendApp] = useActor(actor);

    return <Layout>
        {appState.matches("login") || <Header className="header">
            <Row>
                <Col xs={10} sm={4} className="logo">SMS Gateway</Col>
                <Col xs={14} sm={20}><TopMenu actor={actor} /></Col>
            </Row>
        </Header>}
        <Layout>
            {appState.matches("login") || <Sider width={240} className="site-layout-background">
                <MainMenu actor={actor} />
            </Sider>}
            <Layout style={{ padding: "0 24px 24px" }}>
                <PageContent actor={appState.context.actor} />
            </Layout>
        </Layout>
    </Layout>;
};
