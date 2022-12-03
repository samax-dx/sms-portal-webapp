import {Button, Card, Descriptions, Form, Input, Modal, Table, Tag} from 'antd';
import React, {useEffect, useState} from 'react';
import {ProfileService} from "../services/ProfileService";
import {Link, useNavigate} from "react-router-dom";
import Text from "antd/es/typography/Text";

// const WriteForm = ({ recordArg, onRecordSaved,close }) => {
//
//     const [writeForm] = Form.useForm();
//     const [isCreateForm, setIsCreateForm] = useState(true);
//
//     const [lastWrite, setLastWrite] = useState(recordArg);
//
//     useEffect(() => {
//         setIsCreateForm(Object.keys(recordArg).length === 0);
//         writeForm.resetFields();
//         writeForm.setFieldsValue(recordArg);
//     }, [recordArg]);
//
//     useEffect( () => {
//         if (lastWrite === recordArg) return;
//         isCreateForm && writeForm.resetFields();
//     },[lastWrite]);
//
//     return (<>
//         <Form
//             form={writeForm}
//             labelCol={{ span: 8 }}
//             wrapperCol={{ span: 20 }}
//             labelAlign={"left"}
//             style={{
//                 padding:'15px'
//             }}
//         >
//             <Form.Item name="partyId" label="ID" hidden children={<Input />} />
//             <Form.Item name="loginId" label="User ID" rules={[{ required: true }]} children={<Input disabled={!isCreateForm} />} />
//             <Form.Item name="name" label="Name" rules={[{ required: true }]} children={<Input />} />
//
//             <Form.Item label="Contact Number" required>
//                 <Space direction="horizontal" align="start">
//                     <Form.Item
//                         name="contactMech.countryCode"
//                         rules={[{ required: true }]}
//                         style={{ minWidth: "150px", margin: 0 }}
//                     >
//                         <Select
//                             showSearch
//                             placeholder="country"
//                             optionFilterProp="children"
//                             filterOption={true}
//                             allowClear={true}
//                         >
//                             {
//                                 Object.values(countries).map(({ name, emoji, phone }) => {
//                                     return (
//                                         <Select.Option value={phone} key={phone}>
//                                             {emoji}&nbsp;&nbsp;{name}
//                                         </Select.Option>
//                                     );
//                                 })
//                             }
//                         </Select>
//                     </Form.Item>
//
//                     <Form.Item name="contactMech.areaCode" style={{ maxWidth: "85px" }} children={<Input placeholder="area code" />} />
//                     <Form.Item name="contactMech.contactNumber" rules={[{ required: true }]} children={<Input placeholder="Phone Number" />} />
//                 </Space>
//             </Form.Item>
//             <Form.Item name="emailAddress" label="Email" rules={[{ required: true }]} children={<Input />} />
//             <Form.Item wrapperCol={{ offset: 19}} >
//                 <Button
//                     type="primary"
//                     htmlType="submit"
//                     onClick={() => writeForm
//                         .validateFields()
//                         .then(_ => PartyService.saveRecord(writeForm.getFieldsValue()))
//                         .then(data => {
//                             setLastWrite(data.party);
//                             onRecordSaved(data.party);
//                             notification.success({
//                                 key: `cparty_${Date.now()}`,
//                                 message: "Task Complete",
//                                 description: <>Party created: {data.partyId}</>,
//                                 duration: 5
//                             })
//                         })
//                         .catch(error => notification.error({
//                                 key: `cparty_${Date.now()}`,
//                                 message: "Task Failed",
//                                 description: <>Error creating party.<br/>{error.message}</>,
//                                 duration: 5
//                             })
//                         )
//                     }
//                     children={"Submit"}
//                 />
//                 <Button style={{backgroundColor: '#FF0000', color: 'white', border: 'none', marginLeft: 8}} onClick={close}>Close</Button>
//             </Form.Item>
//         </Form>
//     </>);
// };

export const ProfileView = () => {
    const [profile, setProfile] = useState('');
    const navigate =  useNavigate();

    const [modalData, setModalData] = useState(null);
    const showModal = data => setModalData(data);
    const handleOk = () => setModalData(null);
    const handleCancel = () => setModalData(null);

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
                    <Form.Item name="contactNumber" label="Contact Number" children={<Text strong>{profile.contactNumber}</Text>}/>
                    <Form.Item name="emailAddress" label="Email" children={<Text strong>{profile.emailAddress}</Text>}/>
                    <Button type="primary" onClick={()=> showModal} style={{marginRight:10}}>Edit Profile</Button>
                    <Button type="primary" onClick={()=> navigate("/changePassword")}>Change Password</Button>

                </Form>
                {/*<Modal width={800} closable={false} key="recordEditor" visible={modalData}
                       maskClosable={false} onCancel={handleCancel} style={{ top: 20 }} footer={null}>
                    <WriteForm recordArg={modalData} record={modalData} onRecordSaved={} close={handleCancel}/>
                    {_ => setLastQuery({ ...lastQuery, orderBy: "partyId DESC", page: 1 })
                </Modal>*/}
            </Card>
        </>
    );
}
