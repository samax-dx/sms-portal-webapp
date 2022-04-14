import { useEffect, useState } from "react";
import { useActor } from "@xstate/react";
import { Col, Row, Form, Input, Button, Table, Space, Pagination, Typography, DatePicker, notification, InputNumber, Modal } from "antd";
import dayjs from "dayjs";
import { Br } from "./Br";
import { SearchOutlined } from "@ant-design/icons";
import { ProductPicker } from "./Products";


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
            labelCol={{ span: 4 }}
            wrapperCol={{ span: 7 }}
            labelAlign="left"
        >
            <Form.Item name="orderId" label="Order ID" children={<Input />} />
            <Form.Item name="orderId_op" initialValue={"contains"} hidden children={<Input />} />
            <Form.Item name="orderName" label="Order Name" children={<Input />} />
            <Form.Item name="orderName_op" initialValue={"contains"} hidden children={<Input />} />
            <Form.Item name="productName" label="Product Name" children={<Input />} />
            <Form.Item name="productName_op" initialValue={"contains"} hidden children={<Input />} />
            <Form.Item name="orderDate_fld0_value" label="From Date" children={<DatePicker format={"MMM D, YYYY"} />} />
            <Form.Item name="orderDate_fld0_op" initialValue={"greaterThanEqualTo"} hidden children={<Input />} />
            <Form.Item name="orderDate_fld1_value" label="To Date" children={<DatePicker format={"MMM D, YYYY"} />} />
            <Form.Item name="orderDate_fld1_op" initialValue={"lessThanEqualTo"} hidden children={<Input />} />
            <Form.Item wrapperCol={{ offset: 4 }}>
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

            <Table.Column title="Title" dataIndex={"orderName"} />
            <Table.Column title="Date" dataIndex={"orderDate"} render={date => dayjs(date).format("DD-MM-YYYY")} />
            <Table.Column title="Product" dataIndex={"productName"} />
            <Table.Column title="Unit Price" dataIndex={"unitPrice"} />
            <Table.Column title="Quantity" dataIndex={"quantity"} />
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
    const [choosingParty, setChoosingParty] = useState(false);

    const sendPagedQuery = queryData => (page, limit) => {
        console.log(queryData, page, limit);
        const query = { data: { ...queryData, page, limit }, type: "LOAD" };
        return sendLookup(query);
    };

    const saveRecord = data => {
        console.log(data);
        return sendSave({ data, type: "LOAD" });
    };

    useEffect(() => sendPagedQuery({})(1, 10), []);

    useEffect(() => {
        saveActor.subscribe(state => {
            const lookupContext = lookupActor.getSnapshot().context;
            const saveContext = saveActor.getSnapshot().context;

            if (state.matches("hasResult")) {
                sendPagedQuery({ orderBy: "orderId DESC" })(1, lookupContext.payload.data.limit);

                notification.success({
                    message: "Task Complete",
                    description: <>Order created: {saveContext.result.orderId}</>,
                    duration: 5
                });

                editForm.resetFields();
            }

            if (state.matches("hasError")) {
                notification.error({
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

    const onClickView = data => console.log("view", data);
    const onClickEdit = data => console.log("edit", data);
    const onClickDelete = data => console.log("delete", data);

    const viewContext = lookupState.context;

    const viewPage = viewContext.payload.data.page;
    const viewLimit = viewContext.payload.data.limit;

    return (<>
        <Row>
            <Col md={14}>
                <Typography.Text strong>Find Orders</Typography.Text>
                <Br />
                <SearchForm onSearch={data => sendPagedQuery(data)(1, viewLimit)} />
            </Col>
            <Col md={10} pull={2}>
                <Typography.Text strong>Purchase Product</Typography.Text>
                <Br />
                <EditForm form={editForm} record={{}} onSave={saveRecord} onFindProduct={() => setChoosingParty(true)} />
                <Br />
            </Col>
        </Row>
        <DataView context={viewContext} onView={onClickView} onEdit={onClickEdit} onDelete={onClickDelete} viewPage={viewPage} viewLimit={viewLimit} />
        <Br />
        <DataPager totalPagingItems={viewContext.result.count} currentPage={viewPage} onPagingChange={sendPagedQuery(viewContext.payload.data)} />
        <Modal visible={choosingParty} footer={null} onCancel={() => setChoosingParty(false)} width={"90vw"}>
            <ProductPicker actor={productActor} onPicked={({ productId }) => setChoosingParty(false) || editForm.setFieldsValue({ productId })} />
        </Modal>
    </>);
};
