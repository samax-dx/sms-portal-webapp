import React, { useEffect, useRef, useState } from "react";
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
    Modal, Typography, DatePicker, notification
} from "antd";
import {ExclamationCircleOutlined, PlusCircleFilled} from "@ant-design/icons";
import {ForbiddenWordsService} from "../services/ForbiddenWordsService";
import {PartyIdCatcher} from "./HomeNew";


const SearchForm = ({ onSearch }) => {
    const [searchForm] = Form.useForm();

    const performSearch = () => {
        const formData = searchForm.getFieldsValue();

      /*  ["createdOn_fld0_value", "createdOn_fld1_value"].forEach((n, i) => {
            const date = formData[n];
            formData[n] = date ? dayjs(date).add(i, "day").format("YYYY-MM-DD") : null;

            if (formData[n] === null) {
                delete formData[n];
            }
        });*/

        const queryData = ["forbiddenWords", "createdOn_fld0_value", "createdOn_fld1_value"].reduce((acc, v) => {
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

        // queryData = { userName: "value", userName_op: "contains", phoneNumber: "value", phoneNumber_op: "contains" };
        onSearch(Object.keys(queryData).length ? queryData : null);
    };

    return (<>
        <Form
            form={searchForm}
            labelCol={{ span: 18 }}
            wrapperCol={{ span: 23 }}
            labelAlign="left"
        >
            <Form.Item name="forbiddenWords" label="Words" children={<Input />} style={{ display: "inline-block", marginBottom: '0px' }} />
            <Form.Item name="forbiddenWords_op" initialValue={"contains"} hidden children={<Input />} />

            {/*<Form.Item name="createdOn_fld0_value" label="From Date" style={{display: 'inline-block', marginBottom: '0px'}} children={<DatePicker format={"MMM D, YYYY"}/>}/>
            <Form.Item name="createdOn_fld0_op" initialValue={"greaterThanEqualTo"} hidden children={<Input/>}/>
            <Form.Item name="createdOn_fld1_value" label="To Date" style={{display: 'inline-block', marginBottom: '0px'}} children={<DatePicker format={"MMM D, YYYY"}/>}/>
            <Form.Item name="createdOn_fld1_op" initialValue={"lessThanEqualTo"} hidden children={<Input/>}/>*/}

            <Form.Item style={{ display: 'inline-block', marginBottom: 0 }} label=" " colon={false}>
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

const WriteForm = ({ recordArg, onRecordSaved,close }) => {
    const { Option } = Select;
    console.log(recordArg);

    const partyId = PartyIdCatcher();
    const [writeForm] = Form.useForm();
    const [isCreateForm, setIsCreateForm] = useState(true);

    const [routes, setRoutes] = useState([]);
    const [lastWrite, setLastWrite] = useState(recordArg);


    const transformRecordAtoS = r => {
        console.log(r);
        const record = { ...r };
        // record.parties = record.parties?.join(",");
        // record.routes = record.routes?.join(",");
        record.words = record.words?.join(",");
        return record;
    };
    const transformRecordStoA = r => {
        const record = { ...r };
        // record.parties = record.parties?.map(party => party.partyId);
        // record.routes = record.routes?.map(route => route.routeId);
        // record.words = record.words?.map(word => console.log(word));
        return record;
    };

    // useEffect(() => {
    //     RouteService.fetchRecords({})
    //         .then(data => {
    //             setRoutes(data.routes);
    //         })
    // }, [])

    useEffect(() => {
        setIsCreateForm(Object.keys(recordArg).length === 0);
        writeForm.resetFields();
        writeForm.setFieldsValue(transformRecordStoA(recordArg));
    }, [recordArg]);

    useEffect( () => {
        if (lastWrite === recordArg) return;
        isCreateForm && writeForm.resetFields();
    },[lastWrite]);

    return (<>
        <Form
            form={writeForm}
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 20 }}
            labelAlign={"left"}
            style={{
                padding: '15px'
            }}
        >
            <Form.Item name="forbiddenWordsId" label="Fobidden Words Id" hidden rules={[{ required: false }]} children={<Input />} />
            <Form.Item name="forbiddenWords" label="Fobidden Words" rules={[{ required: true }]} children={<Input placeholder="Please Input Comma Seperated Words" />} />
            <Form.Item name="status" label="Status" initialValue={"disabled"} hidden rules={[{ required: true }]} children={<Input />} />
            <Form.Item name="partyId" label="Party Id" hidden initialValue={partyId} children={<Input />} />
            <Form.Item wrapperCol={{ offset: 19}} >
                <Button
                    type="primary"
                    htmlType="submit"
                    onClick={() => writeForm
                        .validateFields()
                        .then(_ => ForbiddenWordsService.saveRecord((writeForm.getFieldsValue())))
                        .then(data => {
                            console.log(data);
                            setLastWrite(data);
                            onRecordSaved(data);
                            notification.success({
                                key: `csenderid_${Date.now()}`,
                                message: "Task Complete",
                                description: <>Forbidden Words Saved: {data.words}</>,
                                duration: 5
                            });
                        })
                        .catch(error =>{
                            notification.error({
                            key: `csenderid_${Date.now()}`,
                            message: "Task Failed",
                            description: <>Error creating Forbidden Words.<br />{error.message}</>,
                            duration: 5
                        });
                      })
                    }
                    children={"Submit"}
                />
                <Button style={{backgroundColor: '#FF0000', color: 'white', border: 'none',marginLeft:6}} onClick={close}>Close</Button>
            </Form.Item>
        </Form>
    </>);
};

const DataView = ({ forbiddenWords, viewPage, viewLimit, onEdit, onDelete, onEnable, onDisable }) => {

    const confirmDelete = forbiddenWordsId => Modal.confirm({
        title: 'Confirm delete rate?',
        icon: <ExclamationCircleOutlined />,
        content: <>Deleting Words: <strong>{forbiddenWordsId}</strong></>,
        onOk() {
            onDelete(forbiddenWordsId);
            console.log("Clicked");
        }
    });
    const enableWords = record => Modal.confirm({
        title:'Confirm Enabling Words?',
        icon:<ExclamationCircleOutlined/>,
        content: <>Enabling Words: <strong>{record.forbiddenWordsId}</strong></>,
        onOk() {
            onEnable(record);
            console.log("Clicked");
        }
    });
    const disableWords = record => Modal.confirm({
        title:'Confirm Enabling Words?',
        icon:<ExclamationCircleOutlined/>,
        content: <>Disabling Words: <strong>{record.forbiddenWordsId}</strong></>,
        onOk() {
            onDisable(record);
            console.log("Clicked");
        }
    });
    return (<>
        <Table
            style={{ marginLeft: 6 }}
            size="small"
            dataSource={forbiddenWords}
            rowKey={"forbiddenWordsId"}
            locale={{ emptyText: forbiddenWords === null ? "E" : "No Data" }}
            pagination={false}
        >
            <Table.Column
                dataIndex={undefined}
                title={"#"}
                render={(_, __, i) => (viewPage - 1) * viewLimit + (++i)}
            />
            <Table.Column title={<strong>Forbidden Words Id</strong>} dataIndex={"forbiddenWordsId"} />
            <Table.Column title={<strong>Forbidden Words</strong>} dataIndex={"forbiddenWords"} />
            <Table.Column title={<strong>Status</strong>} dataIndex={"status"} />
            {/*<Table.Column title="Party Id" dataIndex={"partyId"} />*/}
            <Table.Column
                title={<strong>Actions</strong>}
                dataIndex={undefined}
                render={(value, record, index) => {
                    return (<>
                        <Button onClick={() =>enableWords(record)} type="link">Enable</Button>
                        <Button onClick={() => disableWords(record)} type="link">Disable</Button>
                            <Button onClick={() => onEdit(record)} type="link">Edit</Button>
                        <Button onClick={() => confirmDelete(record.forbiddenWordsId)} type="link">Delete</Button>
                        </>
                    );
                }}
            />
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

export const ForbiddenWords = () => {
    const [lastQuery, setLastQuery] = useState({});
    const [forbiddenWords, setForbiddenWords] = useState([]);
    const [wordsFetchResultCount, setWordsFetchResultCount] = useState(0);
    const [wordsFetchError, setWordsFetchError] = useState(null);

    const { Title } = Typography;

    const [modalData, setModalData] = useState(null);
    const showModal = data => setModalData(data);
    const handleOk = () => setModalData(null);
    const handleCancel = () => setModalData(null);

    useEffect(() => {
        ForbiddenWordsService.fetchRecords(lastQuery)
            .then((data) => {
                setForbiddenWords(data.forbiddenWords);
                setWordsFetchResultCount(data.count);
                setWordsFetchError(null);
            })
            .catch(error => {
                setForbiddenWords([]);
                setWordsFetchResultCount(0);
                setWordsFetchError(error);
            });
    }, [lastQuery]);

    useEffect(() => {
        setLastQuery({ page: 1, limit: 10 })
    }, []);

    const removeforbiddenWordsId = forbiddenWordsId => {
        ForbiddenWordsService.removeRecord({forbiddenWordsId})
            .then(data => {
                setLastQuery({ ...lastQuery, page: 1 });
                notification.success({
                    key: `forbiddenWordsId_${Date.now()}`,
                    message: "Task Finished",
                    description: `forbiddenWords deleted: ${forbiddenWordsId}`,
                    duration: 15
                });
            })
            .catch(error => {
                notification.error({
                    key: `forbiddenWordsId_${Date.now()}`,
                    message: "Task Failed",
                    description: `Error Deleting forbiddenWordsId: ${forbiddenWordsId}`,
                    duration: 15
                });
            });
    };
    const enableforbiddenWords = record => {
        ForbiddenWordsService.enableOrDisableWords({forbiddenWordsId:record.forbiddenWordsId, status:"enabled"})
            .then(data => {
                console.log(data);
                setLastQuery({ ...lastQuery, page: 1 });
                notification.success({
                    key: `forbiddenWordsId_${Date.now()}`,
                    message: "Task Finished",
                    description: `Words Enabled: ${record.forbiddenWordsId}`,
                    duration: 15
                });
            })
            .catch(error => {
                notification.error({
                    key: `forbiddenWordsId_${Date.now()}`,
                    message: "Task Failed",
                    description: `Error Enabling: ${record.forbiddenWordsId}`,
                    duration: 15
                });
            });
    };
    const disableforbiddenWords = record => {
        ForbiddenWordsService.enableOrDisableWords({forbiddenWordsId:record.forbiddenWordsId, status:"disabled"})
            .then(data => {
                setLastQuery({ ...lastQuery, page: 1 });
                notification.success({
                    key: `forbiddenWordsId_${Date.now()}`,
                    message: "Task Finished",
                    description: `Words Disabled: ${record.forbiddenWordsId}`,
                    duration: 15
                });
            })
            .catch(error => {
                notification.error({
                    key: `forbiddenWordsId_${Date.now()}`,
                    message: "Task Failed",
                    description: `Error Disabling: ${record.forbiddenWordsId}`,
                    duration: 15
                });
            });
    };

    return (<>
        <Row style={{ marginLeft: 5 }}>
            <Col md={24}>
                <Card title={<Title level={5}>Forbidded Words</Title>}
                    headStyle={{ backgroundColor: "#f0f2f5", border: 0, padding: '0px' }}
                    extra={
                        <Button type="primary" style={{ background: "#1890ff", borderColor: "#1890ff" }}
                            icon={<PlusCircleFilled />} onClick={() => showModal({})}>
                            Create Forbidded Words
                        </Button>}
                    style={{ height: 135 }} size="small">
                    <SearchForm onSearch={data => setLastQuery({ ...(data || {}), page: 1, limit: lastQuery.limit })} />
                </Card>
            </Col>
        </Row>
        <DataView forbiddenWords={forbiddenWords} viewLimit={lastQuery.limit} viewPage={lastQuery.page} onEdit={showModal} onEnable={enableforbiddenWords} onDisable={disableforbiddenWords} onDelete={removeforbiddenWordsId} />
        <DataPager totalPagingItems={wordsFetchResultCount} currentPage={lastQuery.page}
            onPagingChange={(page, limit) => setLastQuery({ ...lastQuery, page, limit })} />
        <Modal width={800} key="recordEditor" visible={modalData} maskClosable={false} onCancel={handleCancel} closable={false}  footer={null} bodyStyle={{height:"15rem"}}>
            <WriteForm recordArg={modalData} onRecordSaved={_ => setLastQuery({ ...lastQuery, orderBy: "forbiddenWords DESC", page: 1 })} close={handleCancel}/>
        </Modal>
    </>);
};
