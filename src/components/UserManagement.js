import {
    Button,
    Card, Checkbox,
    Col,
    DatePicker,
    Form,
    Input,
    message,
    Modal,
    Row, Select,
    Space,
    Table,
    Tag,
    Tooltip,
    Upload
} from 'antd';
import React, {useState} from 'react';
import dayjs from "dayjs";
import Title from "antd/es/typography/Title";
import {FileDoneOutlined, FileTextOutlined, FileTextTwoTone, PlusCircleFilled} from "@ant-design/icons";
import * as sheetjs from "xlsx";


const EditForm = ({ form, record, onSave }) => {
    const [editForm] = Form.useForm(form);
    const [type, setType] = useState('default');
    const { Option } = Select;
    const children = [];
    const handleChange = (value) => {
        console.log(`Selected: ${value}`);
    };
    for (let i = 10; i < 36; i++) {
        children.push(<Option key={i.toString(36) + i}>{i.toString(36) + i}</Option>);
    }

    return (<>
        <Form
            form={editForm}
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 20 }}
            labelAlign={"left"}
            style={{
                padding:'35px'
            }}
        >
            <Form.Item name="campaignName" label="User Name" rules={[{ required: true }]} children={<Input />} />

            <Form.Item name="senderId" label="Roles" rules={[{ required: true }]} initialValue={"8801552146283"} children={ <Select
                mode="multiple"
                size={'middle'}
                placeholder="Please select"
                defaultValue={['a10', 'c12']}
                onChange={handleChange}
                style={{
                    width: '100%',
                }}
            >
                {children}
            </Select>} />
        </Form>
    </>);
};

const SearchForm = ({ onSearch }) => {
    const [searchForm] = Form.useForm();

    const performSearch = () => {
        const formData = searchForm.getFieldsValue();

        ["date_fld0_value", "date_fld1_value"].forEach((n, i) => {
            const date = formData[n];
            formData[n] = date ? dayjs(date).add(i, "day").format("YYYY-MM-DD") : "";
        });

        const queryData = ["productName", "date_fld0_value", "date_fld1_value"].reduce((acc, v) => {
            const field = v;
            const fieldOp = `${field.replace("_value", "")}_op`;
            const fieldValue = (acc[field] || "").trim();

            if (fieldValue === "") {
                delete acc[field];
                delete acc[fieldOp];
            } else {
                acc[field] = fieldValue;
            }

            return acc;
        }, formData);
        onSearch(queryData);
    };

    return (<>
        <Form
            form={searchForm}
            labelCol={{ span: 15}}
            wrapperCol={{ span: 20 }}
            labelAlign="left"
        >
            <Form.Item style={{display:'inline-block', margin:'0px'}} name="productName" label="User Name" children={<Input />} />
            <Form.Item name="productName_op" initialValue={"contains"} hidden children={<Input />} />
            <Form.Item name="date_fld0_value" label="From Date" hidden children={<DatePicker format={"MMM D, YYYY"} />} />
            <Form.Item name="date_fld0_op" initialValue={"greaterThanEqualTo"} hidden children={<Input />} />
            {/*<Form.Item style={{display:'inline-block', margin:'0px'}} name="date_fld1_value" label="To Date" hidden children={<DatePicker format={"MMM D, YYYY"} />} />*/}
            <Form.Item name="date_fld1_op" initialValue={"lessThanEqualTo"} hidden children={<Input />} />
            <Form.Item style={{display:'inline-block', margin:'0px'}} colon={false} label=' '>
                <Button
                    type="primary"
                    htmlType="submit"
                    onClick={performSearch}
                    children={"Search"}
                />
            </Form.Item>
        </Form>
    </>);
};


const DataView = () => {
    const [editForm] = Form.useForm();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const showModal = () => {
        setIsModalVisible(true);
    };
    const handleOk = () => {
        setIsModalVisible(false);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
    };

    const columns = [
        {
            title: 'Id',
            dataIndex: 'id',
            key: 'age',
        },
        {
            title: 'User Name',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Password',
            dataIndex: 'password',
            key: 'password',
        },
        {
            title: 'Roles',
            dataIndex: 'roles',
            key: 'roles',
        },
        {
            title: 'Action',
            dataIndex: 'action',
            key: 'action',
        },

    ];
    const data = [
        {
            key: '1',
            name: 'John Brown',
            password:'*****',
            id: 32,
            roles: 'Admin, Viewer',
            action: <> <a>Edit</a> </>
        },
        {
            key: '2',
            name: 'Jim Green',
            password:'*****',
            id: 42,
            roles: 'Editor',
            action: <> <a>Edit</a> </>
        },
    ];

    return (<>
        <Table
            style={{marginLeft:'6px'}}
            size="small"
            dataSource={data}
            pagination={false}
        >
            <Table.Column
                dataIndex={'id'}
                title={"Id"}
                // render={(_, __, i) => (viewPage - 1) * viewLimit + (++i)}
            />

            <Table.Column
                title="User Name"
                dataIndex={"name"}
                /*render={(_, campaign, i) => {
                    return (
                        <Button onClick={() => onView(campaign)} type="link">{campaign.campaignId}</Button>
                    );
                }}*/
            />
            <Table.Column title="Password" dataIndex={"password"} />
            <Table.Column title="Roles" dataIndex={"roles"} />
            <Table.Column title="Action" dataIndex={"action"}/>
        </Table>
        <Modal width={1000} header="Create Campaign" key="createCampaign" visible={isModalVisible} onOk={handleOk} onCancel={handleCancel}>
            <EditForm form={editForm} record={{}} />
        </Modal>
    </>);
};

export const UserManagement = () => {
    const [editForm] = Form.useForm();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const showModal = () => {
        setIsModalVisible(true);
    };
    const handleOk = () => {
        setIsModalVisible(false);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
    };
    return(<>
            <Row>
                <Col md={24} style={{marginLeft:'5px'}}>
                    <Card title={<Title level={5}>Users</Title>}
                          headStyle={{backgroundColor:"#f0f2f5", border: 0,padding:'0px'}}
                          size="small"
                          extra={
                              <Button type="primary" style={{ background:"#1890ff", borderColor:"#1890ff"}} icon={<PlusCircleFilled />} onClick={showModal}>
                                  Create User
                              </Button>}
                    >
                        <SearchForm />
                    </Card>
                </Col>
                <Modal width={1000} header="Create Campaign" key="createCampaign" visible={isModalVisible} onOk={handleOk} onCancel={handleCancel}>
                    <EditForm form={editForm} record={{}} />
                </Modal>
            </Row>
            <DataView/>
        </>
    )
}