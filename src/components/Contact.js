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
    Modal, Typography, DatePicker, notification, List, Tag, Divider, Statistic
} from "antd";
import Title from "antd/es/typography/Title";
import dayjs from "dayjs";
import {useParams} from "react-router-dom";
import moment from "moment/moment";
import {ContactBookService} from "../services/ContactBook/ContactBookService";
import {ContactService} from "../services/ContactBook/ContactService";


const SearchForm = ({onSearch}) => {
    const [searchForm] = Form.useForm();

    const performSearch = () => {// {[fieldName]: value}
        const formData = searchForm.getFieldsValue();

        // ["cratedOn_fld0_value", "cratedOn_fld1_value"].forEach((n, i) => {
        //     const date = formData[n];
        //     formData[n] = date ? dayjs(date).add(i, "day").format("YYYY-MM-DD") : "";
        // });

        const queryData = ["contactName", "cratedOn_fld0_value", "cratedOn_fld1_value"].reduce((acc, v) => {
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


const DataPager = ({totalPagingItems, currentPage, onPagingChange}) => {
    return (<>
        <Space align="end" direction="vertical" style={{width: "100%"}}>
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
            <Form.Item name="groupId" label="Group ID" initialValue={groupId} hidden children={<Input />} />

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

export const Contact = () => {
    const {groupId} = useParams();
    const [writeForm] = Form.useForm();

    // Component States
    const [lastQuery, setLastQuery] = useState({});
    const [group, setGroup] = useState([]);
    const [groupFetchError, setGroupFetchError] = useState(null);

    const [contacts, setContacts] = useState([]);
    const [contactFetchCount, setContactFetchCount] = useState(0);

    const [modalData, setModalData] = useState(null);
    const showModal = data => setModalData(data);
    const handleOk = () => setModalData(null);
    const handleCancel = () => setModalData(null);

    const hasSubTask = task => {
        if(task.instances && task.instances.split(",").length > 1){
            return true;
        } else {
            return false;
        }
    };

    const unixToMomentTime = value => {
        if(value==null) return "";
        const parseValue = parseInt(value)
        const finalTime=  moment(parseValue).format('MMMM Do YYYY, h:mm:ss a');
        return finalTime;
    }

    useEffect(() => {
        ContactBookService.fetchGroupRecords({ ...lastQuery, groupId })
            .then((data) => {
                setGroup(data.group);
                setContacts(data.contacts);
                setContactFetchCount(data.count);
                setGroupFetchError(null);
            })
            .catch(error => {
                setContacts([]);
                setContactFetchCount(0);
                setGroupFetchError(error);
            });
    }, [lastQuery]);

    useEffect(() => {
        setLastQuery({ page: 1, limit: 10 })
    }, []);


    return (<>
        <Card bordered={false} bodyStyle={{padding: 0}}>
            <Space direction="horizontal" size={"small"}>
                <Title level={4} style={{display:'block', marginTop: 5}}>Group:</Title>
                <Statistic style={{marginRight: 50, marginBottom: 5, display:'block'}} title="" value={group.groupName} groupSeparator="" />
                <Title level={4} style={{display:'block', marginTop: 5, color: "green"}}>Total Contact:</Title>
                <Statistic title="" style={{marginRight: 50, marginBottom: 5}} value={contactFetchCount} valueStyle={{color: "green"}}/>
            </Space>
        </Card>

        <Card size="small">
            <Row justify="space-between">
                <Col style={{display: "flex", alignItems: "end"}}>
                    <SearchForm style={{margin: 0, marginBottom: 0}} onSearch={data => setLastQuery({ ...(data || {}), page: 1, limit: lastQuery.limit })}/>
                </Col>
                <Col>
                    <Button style={{marginTop: 18}} type={"primary"} onClick={showModal}>Create Contact</Button>
                </Col>
            </Row>

        </Card>

        <Card>
            <Table
                size="small"
                dataSource={contacts.map(task => {

                    if (!hasSubTask(task)) {
                        return task;
                    }

                    const newTask = {...task};


                    const children = task.instances.split(',').map(msgChunk => {
                        const decodedMsgChunk = atob(msgChunk);
                        const clonedTask = {...task};
                        clonedTask.message = decodedMsgChunk;
                        return clonedTask;
                    })
                    newTask.children = children;
                    return newTask;
                })}
                rowKey={"contactId"}
                locale={{emptyText: contacts === null ? "E" : "NO DATA"}}
                pagination={false}

            >
                <Table.Column
                    title={"#"}
                    render={(_, __, i) => (/*viewPage*/1 - 1) * /*viewLimit*/10 + (++i)}
                />

                <Table.Column title="Contact Id" dataIndex={"contactId"}/>
                <Table.Column title="Contact Name" dataIndex={"contactName"}/>
                <Table.Column title="Contact Number" dataIndex={"contactNumber"}/>
                <Table.Column title="Group ID" dataIndex={"groupId"}/>
            </Table>
            <Modal key="createGroup" visible={modalData} footer={[<Button style={{backgroundColor: '#FF0000', color: 'white', border: 'none'}} onClick={handleOk}>Close</Button>]} onCancel={handleCancel} maskClosable={false} closable={false} style={{ top: 20 }}>
                <WriteForm form={writeForm} groupId={groupId} record={modalData} onRecordSaved={_ => setLastQuery({ ...lastQuery, orderBy: "updatedOn DESC", page: 1 })} />
            </Modal>
            <DataPager totalPagingItems={contactFetchCount} currentPage={lastQuery.page}
                       onPagingChange={(page, limit) => setLastQuery({ ...lastQuery, page, limit })} />
        </Card>
    </>);
};
