import {
    Badge,
    Button,
    Card,
    Descriptions, Divider,
    Form,
    Input,
    Modal,
    notification,
    Select,
    Space,
    Table,
    Tag,
    Typography
} from 'antd';
import React, {useEffect, useState} from 'react';
import {ProfileService} from "../services/ProfileService";
import {Link, useNavigate} from "react-router-dom";
import Title from "antd/es/typography/Title";
import getAllConfig from '../config/main';
const { Paragraph } = Typography;


export const ApiDocument = () => {
    const [lastQuery, setLastQuery] = useState({});
    const [profile, setProfile] = useState('');
    const navigate =  useNavigate();


    useEffect(() => {
        ProfileService.fetchProfile({})
            .then(data => {
                console.log(data);
                setProfile(data.profile);
            })
    }, [lastQuery])
    useEffect(() => {
        setLastQuery({ page: 1, limit: 10 })
    }, []);

    return (
        <>
            <Card
                title={<Title level={5}>API Documentations</Title>}
                style={{paddingLeft:0,margin:0,textAlign:'left'}}
            >
                <Space split={<Divider type="vertical" style={{height: "16vh"}}/>} size={"large"}
                       style={{alignItems: 'start'}}>

                <Card title={<Title style={{lineHeight: '0.5'}} level={4}>Test User Info :</Title>}
                      size="small"
                      style={{border: 'none', margin: '0px', padding: '0px'}}
                      headStyle={{border: 'none'}}
                      bodyStyle={{padding: 0, margin: 0, marginLeft: 10}}
                >
                    <span style={{color:"green"}}>UserId : <Paragraph copyable>link3</Paragraph></span>
                    <span style={{color:"green"}}>Password : <Paragraph copyable>12345</Paragraph></span>
                </Card>

                <Card title={<Title style={{lineHeight: '0.5'}} level={4}>User Info :</Title>}
                      size="small"
                      style={{border: 'none', margin: '0px', padding: '0px'}}
                      headStyle={{border: 'none'}}
                      bodyStyle={{padding: 0, margin: 0, marginLeft: 10}}
                >
                    <span style={{color:"green"}}>UserId : <Paragraph copyable>{profile.loginId}</Paragraph></span>
                    <span style={{color:"green"}}>Password : <Paragraph> Use your password </Paragraph></span>
                    <span style={{color:"green"}}>Client portal : <Paragraph copyable>{getAllConfig.clientPortal}</Paragraph></span>
                </Card>

                <Card title={<Title style={{lineHeight: '0.5'}} level={4}>Admin User Info :</Title>}
                      size="small"
                      style={{border: 'none', margin: '0px', padding: '0px'}}
                      headStyle={{border: 'none'}}
                      bodyStyle={{padding: 0, margin: 0, marginLeft: 10}}
                >
                    <span style={{color:"green"}}>UserId : <Paragraph copyable>admin</Paragraph></span>
                    <span style={{color:"green"}}>Password : <Paragraph copyable> ofbiz</Paragraph></span>
                    <span style={{color:"green"}}>Admin Portal : <Paragraph copyable>{getAllConfig.adminPortal}</Paragraph></span>
                </Card>
                </Space>
                <Typography style={{fontSize: "18px", color:"red", fontWeight:"bold"}}>For Authorization</Typography>
                <Badge.Ribbon text="POST">
                    <Card title={<Title level={5}>Method POST</Title>} size="small">
                        <span style={{color:"green"}}>Get token :<Paragraph copyable>{getAllConfig.getToken}</Paragraph></span>
                        <span style={{color:"green"}}>Payload JSON Format : <Paragraph> &#123;"loginId":"link3","password":"12345"&#125;</Paragraph></span>
                        <span style={{color:"green"}}>Keys :<Paragraph>loginId,password</Paragraph></span>
                        <span style={{color:"green"}}>Response Sample :<Paragraph>&#123;"token":"eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJsb2dpbklkIjoibGluazMiLCJleHAiOjE2ODA3NjQ4ODQsInBhcnR5SWQiOiIxMDAwMCJ9.XAEkhSKw-vWc2hmD6JNA-VSRTDFglQogj4AZOGMNo3M"&#125;</Paragraph></span>
                    </Card>
                </Badge.Ribbon>

                <Typography style={{fontSize: "18px", color:"red", fontWeight:"bold"}}>For Sending Message</Typography>
                <Badge.Ribbon text="POST">
                    <Card title={<Title level={5}>Method POST</Title>} size="small">
                        <span style={{color:"green"}}>URL :<Paragraph copyable>{getAllConfig.sendMsg}</Paragraph></span>
                        <span style={{color:"green"}}>Payload Sample : <Paragraph> &#123;"senderId":"8809678123200","phoneNumbers":"01743801850","message":"Test From Api","charEncoding":"gsm7"&#125;</Paragraph></span>
                        <Typography style={{color:"red", fontSize:"16px"}}>Add Head option:</Typography>
                        <Typography >Add with key value :</Typography>
                        <span style={{color:"green"}}>Authorization : Bearer Sample<Paragraph>eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJsb2dpbklkIjoibGluazMiLCJleHAiOjE2ODA3NjQ4ODQsInBhcnR5SWQiOiIxMDAwMCJ9.XAEkhSKw-vWc2hmD6JNA-VSRTDFglQogj4AZOGMNo3M</Paragraph></span>
                        <span style={{color:"green"}}>Keys for sending message :<Paragraph>senderId,phoneNumbers,message,charEncoding</Paragraph></span>
                        <Space direction="vertical">
                            <Badge color="hwb(205 6% 9%)" text="senderId -> string" />
                            <Badge color="hwb(205 6% 9%)" text="phoneNumbers->string, comma separated number for multiple receiver ." />
                            <Badge color="hwb(205 6% 9%)" text="message-> string" />
                            <Badge color="hwb(205 6% 9%)" text="charEncoding-> string , gsm7 supported charEncoding ." />
                        </Space>
                    </Card>
                </Badge.Ribbon>
            </Card>

        </>
    );
}
