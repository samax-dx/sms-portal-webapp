import {Button, Card, Descriptions, Form, Input, Modal, notification, Select, Space, Table, Tag} from 'antd';
import React, {useEffect, useState} from 'react';
import {ProfileService} from "../services/ProfileService";
import {Link, useNavigate} from "react-router-dom";
import Text from "antd/es/typography/Text";
import {countries} from "countries-list";

export const ProfileView = () => {
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
                    <Form.Item name="contactNumber" label="Contact Number" children={<Text strong>{profile.contactNumber}</Text>}/>
                    <Form.Item name="emailAddress" label="Email" children={<Text strong>{profile.emailAddress}</Text>}/>
                    <Button type="primary" onClick={()=> navigate("/editProfile")} style={{marginRight:10}}>Edit Profile</Button>
                    <Button type="primary" onClick={()=> navigate("/changePassword")}>Change Password</Button>

                </Form>
            </Card>
        </>
    );
}
