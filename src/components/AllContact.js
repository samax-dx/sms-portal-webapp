import React, {useEffect, useRef, useState} from "react";
import {
    Form,
    Input,
    Button,
    Table,
    Space,
    Pagination,
    Card,
    Select,
    Row,
    Col,
    Modal, DatePicker, notification, Tooltip, Upload, message, Checkbox, TimePicker, Descriptions
} from "antd";
import Title from "antd/es/typography/Title";
import {Br} from "./Br";
import dayjs from "dayjs";
import {CampaignService} from "../services/CampaignService";
import {FileDoneOutlined, FileTextOutlined, FileTextTwoTone, PlusCircleFilled} from "@ant-design/icons";
import * as sheetjs from "xlsx";
import {Link} from "react-router-dom";
import {GroupService} from "../services/ContactBook/GroupService";
import {ContactService} from "../services/ContactBook/ContactService";
import {DebounceSelect} from "./DebounceSelect";



const SearchForm = ({ onSearch }) => {
    const [searchForm] = Form.useForm();

    const performSearch = () => {
        const formData = searchForm.getFieldsValue();

        // ["cratedOn_fld0_value", "cratedOn_fld1_value"].forEach((n, i) => {
        //     const date = formData[n];
        //     formData[n] = date ? dayjs(date).add(i, "day").format("YYYY-MM-DD") : "";
        // });

        const queryData = ["ContactName", "cratedOn_fld0_value", "cratedOn_fld1_value"].reduce((acc, v) => {
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
            labelCol={{ span: 22 }}
            wrapperCol={{ span: 23 }}
            labelAlign="left"
        >
            <Form.Item style={{display:'inline-block', margin:'0px'}} name="contactName" label="Contact Name" children={<Input />} />
            <Form.Item name="contactName_op" initialValue={"contains"} hidden children={<Input />} />
            {/*<Form.Item style={{display:'inline-block', margin:'0px'}} name="cratedOn_fld0_value" label="From Date" children={<DatePicker format={"MMM D, YYYY"} />} />
            <Form.Item name="cratedOn_fld0_op" initialValue={"greaterThanEqualTo"} hidden children={<Input />} />
            <Form.Item style={{display:'inline-block', margin:'0px'}} name="cratedOn_fld1_value" label="To Date" children={<DatePicker format={"MMM D, YYYY"} />} />
            <Form.Item name="cratedOn_fld1_op" initialValue={"lessThanEqualTo"} hidden children={<Input />} />*/}
            <Form.Item wrapperCol={{ offset: 5 }} style={{display:'inline-block', margin:'0px'}} colon={false} label=' '>
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

const WriteForm = ({ form, record, onRecordSaved,groupId }) => {
    const { Option } = Select;
    const [writeForm] = Form.useForm(form);
    useEffect(() => writeForm.resetFields(), [record, writeForm]);

    return (<>
        <Form
            form={writeForm}
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 20 }}
            labelAlign={"left"}
            style={{
                padding:'35px'
            }}
            onFinish={() => writeForm.resetFields()}
        >
            <Form.Item name="contactId" label="Contact ID" rules={[{ required: false }]} hidden children={<Input />} />
            <Form.Item name="contactName" label="Contact Name" rules={[{ required: true }]} children={<Input />} />
            <Form.Item name="contactNumber" label="Contact Number" rules={[{ required: true }]} children={<Input />} />
            <Form.Item name="groupId" label="Group ID" rules={[{ required: true }]} children={<DebounceSelect />} />

            <Form.Item wrapperCol={{ offset: 8 }}>
                <Button
                    type="primary"
                    htmlType="submit"
                    onClick={() => writeForm
                        .validateFields()
                        .then(_ => writeForm
                            .validateFields()
                            .then(_ => ContactService.saveRecord(writeForm.getFieldsValue()))
                            .then(contacts => {
                                console.log(contacts);
                                onRecordSaved(contacts);
                                notification.success({
                                    key: `ccontact_${contacts.contactId}`,
                                    message: "Task Complete",
                                    description: <>Contact Saved: {contacts.contactId}</>,
                                    duration: 5
                                });
                            })
                            // .catch(error => {alert(error.message)}))
                            .catch(error => {
                                notification.error({
                                    key: `ccontact_${Date.now()}`,
                                    message: "Task Failed",
                                    description: <>Error creating group.<br />{error.message}</>,
                                    duration: 5
                                });
                            }))
                        .catch(_ => { })
                    }
                    children={"Submit"}
                />
            </Form.Item>
        </Form>
    </>);
};

const DataView = ({ contacts, viewPage, viewLimit, onView}) => {

    return (<>
        <Table
            style={{marginLeft:'6px'}}
            size="small"
            dataSource={contacts}
            rowKey={"contactId"}
            locale={{ emptyText: contacts ===null? "E": "NO DATA" }}
            pagination={false}
        >
            <Table.Column
                dataIndex={undefined}
                title={"#"}
                render={(_, __, i) => (viewPage - 1) * viewLimit + (++i)}
            />
            <Table.Column title="Contact ID" dataIndex={"contactId"}/>
            <Table.Column title="Contact Name" dataIndex={"contactName"} />
            <Table.Column title="Contact Number" dataIndex={"contactNumber"} />
            <Table.Column title="Group Id" dataIndex={"groupId"} />
        </Table>
    </>);
};

const DataPager = ({ totalPagingItems, currentPage, onPagingChange }) => {
    return (<>
        <Space align="end" direction="vertical" style={{ width: "100%" }}>
            <Pagination
                total={totalPagingItems}
                defaultPageSize={10}
                pageSizeOptions={["10", "20", "50", "100", "200"]}
                showSizeChanger={true}
                onChange={onPagingChange}
                current={currentPage}
            />
        </Space>
    </>);
};

export const AllContact = () => {

    const [writeForm] = Form.useForm();
    // Component States
    const [lastQuery, setLastQuery] = useState({});
    const [contacts, setContacts] = useState([]);
    const [contactsFetchCount, setContactsFetchCount] = useState(0);
    const [contactsFetchError, setContactsFetchError] = useState(null);

    const [modalData, setModalData] = useState(null);
    const showModal = data => setModalData(data);
    const handleOk = () => setModalData(null);
    const handleCancel = () => setModalData(null);


    useEffect(() => {
        ContactService.fetchRecords(lastQuery)
            .then((data) => {
                console.log(data)
                setContacts(data.contacts);
                setContactsFetchCount(data.count);
                setContactsFetchError(null);
            })
            .catch(error => {
                setContacts([]);
                setContactsFetchCount(0);
                setContactsFetchError(error);
            });
    }, [lastQuery]);

    useEffect(() => {
        setLastQuery({ page: 1, limit: 10 })
    }, []);


    return (<>
        <Row >
            <Col md={24} style={{marginLeft:'5px'}}>
                <Card title={<Title level={5}>All Contact</Title>}
                      headStyle={{backgroundColor:"#f0f2f5", border: 0,padding:'0px'}}
                      size="small"
                      extra={
                          <Button type="primary" style={{ background:"#1890ff", borderColor:"#1890ff"}} icon={<PlusCircleFilled />} onClick={showModal}>
                              Create Contact
                          </Button>}
                >
                    <SearchForm onSearch={data => setLastQuery({ ...(data || {}), page: 1, limit: lastQuery.limit })}/>
                </Card>
            </Col>
            <Modal key="createGroup" visible={modalData} footer={[<Button style={{backgroundColor: '#FF0000', color: 'white', border: 'none'}} onClick={handleOk}>Close</Button>]} onCancel={handleCancel} maskClosable={false} closable={false} style={{ top: 20 }}>
                <WriteForm form={writeForm} record={modalData} onRecordSaved={_ => setLastQuery({ ...lastQuery, orderBy: "updatedOn DESC", page: 1 })} />
            </Modal>
        </Row>
        <DataView contacts={contacts} viewPage={lastQuery.page} viewLimit={lastQuery.limit}/>
        <Br />
        <DataPager totalPagingItems={contactsFetchCount} currentPage={lastQuery.page}
                   onPagingChange={(page, limit) => setLastQuery({ ...lastQuery, page, limit })} />
    </>);
};
