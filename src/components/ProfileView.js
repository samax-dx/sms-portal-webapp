import {Button, Card, Descriptions, Form, Input, Table, Tag} from 'antd';
import React, {useEffect, useState} from 'react';
import {ProfileService} from "../services/ProfileService";
import {Link} from "react-router-dom";
import Text from "antd/es/typography/Text";

export const ProfileView = () => {
    const [profile, setProfile] = useState('');

    useEffect(() => {
        ProfileService.fetchProfile({})
            .then(data => {
                console.log(data);
                setProfile(data.profile);
            })
    }, [])

    return (
        <>
            <Card
                title="User Details"
                style={{paddingLeft:0,margin:0,textAlign:'left'}}
            >
                <Form
                    labelAlign={"left"}
                    style={{
                        padding:0,
                        paddingLeft:"13px",
                    }}
                >
                    <Form.Item name="userName" label="User Name" children={<Text strong>{profile.name}</Text>}/>
                    <Form.Item name="loginId" label="Login Id" children={<Text strong>{profile.loginId}</Text>}/>
                    <Form.Item name="partyId" label="Party Id" children={<Text strong>{profile.partyId}</Text>}/>
                    <Button type="primary">Change Password</Button>
                </Form>
            </Card>
        </>
    );
}
