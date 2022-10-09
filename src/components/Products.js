import { useEffect } from "react";
import { useActor } from "@xstate/react";
import { Col, Row, Form, Input, Button, Table, Space, Pagination, Typography, notification, InputNumber } from "antd";
import { Br } from "./Br";


const SearchForm = ({ onSearch }) => {
    const [searchForm] = Form.useForm();

    const performSearch = () => {
        const formData = searchForm.getFieldsValue();

        const queryData = ["productId", "productName", "volume", "lineup"].reduce((acc, v) => {
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
            <Form.Item name="productId" label="Product ID" children={<Input />} />
            <Form.Item name="productId_op" initialValue={"contains"} hidden children={<Input />} />
            <Form.Item name="productName" label="Product Name" children={<Input />} />
            <Form.Item name="productName_op" initialValue={"contains"} hidden children={<Input />} />
            <Form.Item name="lineup" label="Product Lineup" children={<Input />} />
            <Form.Item name="lineup_op" initialValue={"contains"} hidden children={<Input />} />
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

const EditForm = ({ form, record: party, onSave }) => {
    const [editForm] = Form.useForm(form);

    return (<>
        <Form
            form={editForm}
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 18 }}
            labelAlign={"left"}
        >
            <Form.Item name="productName" label="Product Name" rules={[{ required: true }]}>
                <Input />
            </Form.Item>

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

const DataView = ({ context, viewPage, viewLimit, onView, onEdit, onDelete }) => {// {"originalImageUrl","volume","productId","price","description","lineup","productName"}
    const viewResult = context.result;
    const viewError = context.error;

    return (<>
        <Table
            size="small"
            dataSource={viewResult.products}
            rowKey={"productId"}
            locale={{ emptyText: viewError && `[ ${viewError.message} ]` }}
            pagination={false}
        >
            <Table.Column
                dataIndex={undefined}
                title={"#"}
                render={(_, __, i) => (viewPage - 1) * viewLimit + (++i)}
            />

            <Table.Column
                title="Product ID"
                dataIndex={undefined}
                render={(_, product, i) => {
                    return (
                        <Button onClick={() => onView(product)} type="link">{product.productId}</Button>
                    );
                }}
            />

            <Table.Column title="Name" dataIndex={"productName"} />
            <Table.Column title="lineup" dataIndex={"lineup"} />
            <Table.Column title="volume" dataIndex={"volume"} />
            <Table.Column title="Price" dataIndex={"price"} />
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

export const ProductPicker = ({ actor: lookupActor, onPicked }) => {
    const [lookupState, sendLookup] = useActor(lookupActor);

    const sendPagedQuery = queryData => (page, limit) => {
        page === undefined && (page = queryData.page)
        limit === undefined && (limit = queryData.limit)
        console.log(queryData, page, limit);

        const query = { data: { ...queryData, page, limit }, type: "LOAD" };
        return sendLookup(query);
    };

    useEffect(() => sendPagedQuery(lookupState.context.payload.data)(), []);

    useEffect(() => {
        if (lookupState.matches("idle")) {
            if (lookupState.context.result.count > 0 && lookupState.context.result.products.length === 0) {
                lookupState.context.payload.data.page--;
                sendLookup({ ...lookupState.context.payload, type: "LOAD" });
            }
        }
    }, [lookupState]);

    const onClickView = data => console.log("view", data) || onPicked(data);
    const onClickEdit = data => console.log("edit", data);
    const onClickDelete = data => console.log("delete", data);

    const viewContext = lookupState.context;

    const viewPage = viewContext.payload.data.page;
    const viewLimit = viewContext.payload.data.limit;

    return (<>
        <Row>
            <Col md={10}>
                <Typography.Text strong>Find Products</Typography.Text>
                <Br />
                <SearchForm onSearch={data => sendPagedQuery(data)(1, viewLimit)} />
            </Col>
        </Row>
        <DataView context={viewContext} onView={onClickView} onEdit={onClickEdit} onDelete={onClickDelete} viewPage={viewPage} viewLimit={viewLimit} />
        <Br />
        <DataPager totalPagingItems={viewContext.result.count} currentPage={viewPage} onPagingChange={sendPagedQuery(viewContext.payload.data)} />
    </>);
};
