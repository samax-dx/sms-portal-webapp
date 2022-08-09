import { useEffect, useState } from "react";
import { useActor } from "@xstate/react";
import { Col, Row, Form, Input, Button, Table, Space, Pagination, Typography, DatePicker, notification, InputNumber, Modal, Card, Collapse } from "antd";
import dayjs from "dayjs";
import { Br } from "./Br";
import { SearchOutlined } from "@ant-design/icons";
import { ProductPicker } from "./Products";
import Title from "antd/es/typography/Title";


const SearchForm = ({ onSearch }) => {
    const [searchForm] = Form.useForm();

    const performSearch = () => {
        const formData = searchForm.getFieldsValue();

        ["orderDate_fld0_value", "orderDate_fld1_value"].forEach((n, i) => {
            const date = formData[n];
            formData[n] = date ? dayjs(date).add(i, "day").format("YYYY-MM-DD") : "";
        });

        const queryData = ["orderId", "orderName", "productName", "orderDate_fld0_value", "orderDate_fld1_value"].reduce((acc, v) => {
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
            wrapperCol={{ span: 23 }}
            labelAlign="left"
        >
            <Form.Item style={{display:'inline-block', margin:'0px'}} name="orderId" label="Order ID" hidden children={<Input />} />
            <Form.Item name="orderId_op" initialValue={"contains"} hidden children={<Input />} />
            <Form.Item name="orderName" label="Order Name" hidden children={<Input />} />
            <Form.Item name="orderName_op" initialValue={"contains"} hidden children={<Input />} />
            <Form.Item style={{display:'inline-block', margin:'0px'}} name="productName" label="Package Name" children={<Input />} />
            <Form.Item name="productName_op" initialValue={"contains"} hidden children={<Input />} />
            <Form.Item style={{display:'inline-block', margin:'0px'}} name="orderDate_fld0_value" label="From Date" children={<DatePicker format={"MMM D, YYYY"} />} />
            <Form.Item name="orderDate_fld0_op" initialValue={"greaterThanEqualTo"} hidden children={<Input />} />
            <Form.Item style={{display:'inline-block', margin:'0px'}} name="orderDate_fld1_value" label="To Date" children={<DatePicker format={"MMM D, YYYY"} />} />
            <Form.Item name="orderDate_fld1_op" initialValue={"lessThanEqualTo"} hidden children={<Input />} />
            <Form.Item style={{display:'inline-block', margin:'0px'}} wrapperCol={{ offset: 4 }} colon={false} label=' '>
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

const EditForm = ({ form, record, onSave, onFindProduct }) => {
    const [editForm] = Form.useForm(form);

    return (<>
        <Form
            form={editForm}
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 18 }}
            labelAlign={"left"}
        >
            <Form.Item label="Product ID" required style={{ marginBottom: 0 }}>
                <Space align="start">
                    <Form.Item name="productId" rules={[{ required: true }]}>
                        <Input style={{ width: "150px" }} />
                    </Form.Item>
                    <Button onClick={onFindProduct} children={<SearchOutlined />} />
                </Space>
            </Form.Item>

            <Form.Item name="quantity" label="Quantity" rules={[{ required: true }]} children={<InputNumber style={{ width: "150px" }} />} />

            <Form.Item wrapperCol={{ offset: 6 }}>
                <Button
                    type="primary"
                    htmlType="submit"
                    onClick={() => editForm
                        .validateFields()
                        .then(_ => onSave(editForm.getFieldsValue()))
                        .catch(_ => { })
                    }
                    children={"Submit"}
                />
            </Form.Item>
        </Form>
    </>);
};

const DataView = ({ context, viewPage, viewLimit, onView, onEdit, onDelete }) => {
    const viewResult = context.result;
    const viewError = context.error;

    return (<>
        <Table
            style={{ marginLeft:'6px'}}
            size="small"
            dataSource={viewResult.orders}
            rowKey={"orderId"}
            locale={{ emptyText: viewError && `[ ${viewError.message} ]` }}
            pagination={false}
        >
            <Table.Column
                dataIndex={undefined}
                title={"#"}
                render={(_, __, i) => (viewPage - 1) * viewLimit + (++i)}
            />

            <Table.Column
                title="Order ID"
                dataIndex={undefined}
                render={(_, order, i) => {
                    return (
                        <Button onClick={() => onView(order)} type="link">{order.orderId}</Button>
                    );
                }}
            />

            {/* <Table.Column title="Order Name " dataIndex={"orderName"} /> */}
            <Table.Column title="Package" dataIndex={"productName"} />
            <Table.Column title="Order Date" dataIndex={"orderDate"} render={date => dayjs(date).format("MMM D, YYYY - hh:mm A")} />
            {/* <Table.Column title="Unit Price" dataIndex={"unitPrice"} />
            <Table.Column title="Quantity" dataIndex={"quantity"} /> */}
            <Table.Column title="Price" dataIndex={"grandTotal"} />
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

export const Orders = ({ actor: [lookupActor, saveActor, productActor] }) => {
    const [lookupState, sendLookup] = useActor(lookupActor);
    const [saveState, sendSave] = useActor(saveActor);
    const [editForm] = Form.useForm();

    const sendPagedQuery = queryData => (page, limit) => {
        page === undefined && (page = queryData.page)
        limit === undefined && (limit = queryData.limit)
        console.log(queryData, page, limit);

        const query = { data: { ...queryData, page, limit }, type: "LOAD" };
        return sendLookup(query);
    };

    const saveRecord = data => {
        console.log(data);
        return sendSave({ data, type: "LOAD" });
    };

    const [modalData, setModalData] = useState(null);
    const showModal = data => setModalData(data);
    const handleOk = () => setModalData(null);
    const handleCancel = () => setModalData(null);

    useEffect(() => sendPagedQuery(lookupState.context.payload.data)(), []);

    useEffect(() => {
        saveActor.subscribe(state => {
            const lookupContext = lookupActor.getSnapshot().context;
            const saveContext = saveActor.getSnapshot().context;

            if (state.matches("hasResult")) {
                sendPagedQuery({ ...lookupContext.payload.data, orderBy: "orderId DESC" })();

                notification.success({
                    key: `corder_${Date.now()}`,
                    message: "Task Complete",
                    description: <>Order created: {saveContext.result.orderId}</>,
                    duration: 5
                });

                editForm.resetFields();
            }

            if (state.matches("hasError")) {
                notification.error({
                    key: `corder_${Date.now()}`,
                    message: "Task Failed",
                    description: <>Error placing order.<br />{state.context.error.message}</>,
                    duration: 5
                });
            }
        });
    }, [editForm]);

    useEffect(() => {
        if (lookupState.matches("idle")) {
            if (lookupState.context.result.count > 0 && lookupState.context.result.orders.length === 0) {
                lookupState.context.payload.data.page--;
                sendLookup({ ...lookupState.context.payload, type: "LOAD" });
            }
        }
    }, [lookupState]);

    const onClickView = data => console.log("view", data) || showModal(data);
    const onClickEdit = data => console.log("edit", data);
    const onClickDelete = data => console.log("delete", data);

    const viewContext = lookupState.context;

    const viewPage = viewContext.payload.data.page;
    const viewLimit = viewContext.payload.data.limit;

    return (<>
        <Row style={{padding:'0px'}}>
            <Col md={24} style={{marginLeft:'5px'}}>
                <Card title={<Title level={5}>Orders</Title>}
                      headStyle={{backgroundColor:"#f0f2f5", border: 0,padding:'0px'}} size="small">
                    <SearchForm onSearch={data => sendPagedQuery(data)(1, viewLimit)} />
                </Card>
            </Col>
        </Row>
        <DataView context={viewContext} onView={onClickView} onEdit={onClickEdit} onDelete={onClickDelete} viewPage={viewPage} viewLimit={viewLimit} />
        <Br />
        <Modal title="Basic Modal" visible={!!modalData} onOk={handleOk} onCancel={handleCancel}>
            {JSON.stringify(modalData)}
        </Modal>
        <DataPager totalPagingItems={viewContext.result.count} currentPage={viewPage} onPagingChange={sendPagedQuery(viewContext.payload.data)} />
    </>);
};
