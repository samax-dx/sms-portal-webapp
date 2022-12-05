import {Button, Card, Descriptions, Form, Input, Modal, notification, Select, Space, Table, Tag} from 'antd';
import React, {useEffect, useState} from 'react';
import {ProfileService} from "../services/ProfileService";
import {countries} from "countries-list";
import {PartyService} from "../services/PartyService";

export const EditProfile = ({ recordArg, onRecordSaved,close }) => {

    const [writeForm] = Form.useForm();

    const [lastQuery, setLastQuery] = useState({});
    const [isCreateForm, setIsCreateForm] = useState(true);
    const [profile,setProfile] = useState({});

    const [lastWrite, setLastWrite] = useState(profile);

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

    useEffect(() => {
        setIsCreateForm(Object.keys(profile).length === 0);
        writeForm.resetFields();
        writeForm.setFieldsValue(profile);
    }, [profile]);

    useEffect( () => {
        if (lastWrite === profile) return;
        isCreateForm && writeForm.resetFields();
    },[lastWrite]);

    return (<>
        <Form
            form={writeForm}
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 15 }}
            labelAlign={"left"}
            style={{
                padding:'15px'
            }}
        >
            <Form.Item name="partyId" label="ID" hidden children={<Input />} />
            <Form.Item name="loginId" label="User ID" rules={[{ required: true }]} children={<Input disabled={!isCreateForm} />} />
            <Form.Item name="name" label="Name" rules={[{ required: true }]} children={<Input />} />

            <Form.Item label="Contact Number" required>
                <Space direction="horizontal" align="start">
                    <Form.Item
                        name="contactMech.countryCode"
                        rules={[{ required: true }]}
                        style={{ minWidth: "150px", margin: 0 }}
                    >
                        <Select
                            showSearch
                            placeholder="country"
                            optionFilterProp="children"
                            filterOption={true}
                            allowClear={true}
                        >
                            {
                                Object.values(countries).map(({ name, emoji, phone }) => {
                                    return (
                                        <Select.Option value={phone} key={phone}>
                                            {emoji}&nbsp;&nbsp;{name}
                                        </Select.Option>
                                    );
                                })
                            }
                        </Select>
                    </Form.Item>

                    <Form.Item name="contactMech.areaCode" style={{ maxWidth: "85px" }} children={<Input placeholder="area code" />} />
                    <Form.Item name="contactMech.contactNumber" rules={[{ required: true }]} children={<Input placeholder="Phone Number" />} />
                </Space>
            </Form.Item>
            <Form.Item name="emailAddress" label="Email" rules={[{ required: true }]} children={<Input />} />
            <Form.Item wrapperCol={{ offset: 8}} >
                <Button
                    type="primary"
                    htmlType="submit"
                    onClick={() => writeForm
                        .validateFields()
                        .then(_ => PartyService.saveRecord(writeForm.getFieldsValue()))
                        .then(data => {
                            setLastWrite(data.party);
                            onRecordSaved(data.party);
                            notification.success({
                                key: `cparty_${Date.now()}`,
                                message: "Task Complete",
                                description: <>Party created: {data.partyId}</>,
                                duration: 5
                            })
                        })
                        .catch(error => notification.error({
                                key: `cparty_${Date.now()}`,
                                message: "Task Failed",
                                description: <>Error creating party.<br/>{error.message}</>,
                                duration: 5
                            })
                        )
                    }
                    children={"Submit"}
                />
                {/*<Button style={{backgroundColor: '#FF0000', color: 'white', border: 'none', marginLeft: 8}} onClick={close}>Close</Button>*/}
            </Form.Item>
        </Form>
    </>);
};