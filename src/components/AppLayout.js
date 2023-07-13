import React from 'react';
import { useActor } from '@xstate/react';
import { Col, Row, Layout, Breadcrumb } from 'antd';

import { TopMenu } from "./TopMenu";
import { MainMenu } from './MainMenu';
import getAllConfig from '../config/main'
import {Link} from "react-router-dom";
import {TopMenuNew} from "./TopMenuNew";


const { Header, Sider } = Layout;

export const AppLayout = ({ render: PageContent, actor,routeComponent }) => {
    const [appState, sendApp] = [actor.getSnapshot(), actor.send];

    return [
        <Layout style={{ padding: "24px" }}>
            <PageContent actor={appState.context.actor} />
        </Layout>,
        <Layout>
            <Header className="header" style={{paddingLeft:'7px',paddingRight:'5px'}}>
                <Row>
                    <Col xs={10} sm={4} className="logo" onClick={() => actor.send("NAV_HOME")}>
                        <Link to='/client'><img src={getAllConfig.logo} style={{ marginBottom: "0px" }} /></Link>
                        &nbsp;
                        <Link to="/client" style={{color:'white'}}><span>SMS-Portal Client</span></Link>
                    </Col>
                    <Col xs={14} sm={20} className="menu"><TopMenuNew actor={actor} /></Col>
                </Row>
            </Header>
            <Layout>
                <Sider width={240} className="site-layout-background">
                    <MainMenu actor={actor} />
                </Sider>
                <Layout style={{ padding: "2px" }}>
                    {false && window.location.href.match(/^(?:.*?:\/\/)?(?:[^\/]+)\/?$/)
                        ? <PageContent actor={appState.context.actor}/> : null}
                    {routeComponent}
                </Layout>
            </Layout>
        </Layout>
    ][appState.matches("login") ? 0 : 1];
};
