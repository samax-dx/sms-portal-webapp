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

export const Contact = () => {
    const {groupId} = useParams();

    // Component States
    const [lastQuery, setLastQuery] = useState({});
    const [group, setGroup] = useState([]);
    const [groupFetchError, setGroupFetchError] = useState(null);

    const [contacts, setContacts] = useState([]);
    const [contactFetchCount, setContactFetchCount] = useState(0);

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
                <Card bordered={false} style={{margin: "0px"}}>
                        <List
                            grid={{gutter: 24}}
                            dataSource={[
                                [
                                    ["sentTaskCount", "Group", "success", v => v || 0],
                                    ["pendingTaskCount", "Total Contact", "warning", v => v || 0],
                                ]
                            ]}
                            renderItem={item => item.map(([key, label, type, toValue]) => (<Col>
                                <Statistic
                                    title={<Typography.Text type={type} strong>{label}</Typography.Text>}
                                    value={toValue(contacts[key])}
                                    key={key}
                                />
                            </Col>))}
                        />
                </Card>
        </Card>

        <Card size="small">
            <Row justify="space-between">
                <Col style={{display: "flex", alignItems: "end"}}>
                    <SearchForm style={{margin: 0, marginBottom: 0}} onSearch={data => setLastQuery({ ...(data || {}), page: 1, limit: lastQuery.limit })}/>
                </Col>
                <Col>
                    <Button style={{marginTop: 18}} type={"primary"}>Create Contact</Button>
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
                <Table.Column title="Group ID" dataIndex={"groupId"}/>
            </Table>
            <DataPager totalPagingItems={contactFetchCount} currentPage={lastQuery.page}
                       onPagingChange={(page, limit) => setLastQuery({ ...lastQuery, page, limit })} />
        </Card>
    </>);
};
