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
    Modal, Typography, DatePicker, notification
} from "antd";
import Title from "antd/es/typography/Title";
import {Br} from "./Br";
import dayjs from "dayjs";
import {OrderService} from "../services/OrderService";
import moment from "moment";



const SearchForm = ({ onSearch }) => {
    const [searchForm] = Form.useForm();

    const performSearch = () => {
        const formData = searchForm.getFieldsValue();

        ["orderDate_fld0_value", "orderDate_fld1_value"].forEach((n, i) => {
            const date = formData[n];
            formData[n] = date ? dayjs(date).add(i, "day").format("YYYY-MM-DD HH:mm:ss") : null;

            if (formData[n] === null) {
                delete formData[n];
            }
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
            <Form.Item style={{display:'inline-block', margin:'0px'}} name="orderDate_fld0_value" label="From Date" children={<DatePicker showTime use12Hours={true} format="YYYY-MM-DD HH:mm:ss" />} />
            <Form.Item name="orderDate_fld0_op" initialValue={"greaterThanEqualTo"} hidden children={<Input />} />
            <Form.Item style={{display:'inline-block', margin:'0px'}} name="orderDate_fld1_value" label="To Date" children={<DatePicker showTime use12Hours={true} format="YYYY-MM-DD HH:mm:ss" />} />
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

const DataView = ({ orders, viewPage, viewLimit}) => {

    return (<>
        <Table
            style={{marginLeft:'6px'}}
            size="small"
            dataSource={orders}
            rowKey={"orderId"}
            locale={{ emptyText: orders ===null? "E": "NO DATA" }}
            pagination={false}
        >
            <Table.Column
                dataIndex={undefined}
                title={"#"}
                render={(_, __, i) => (viewPage - 1) * viewLimit + (++i)}
            />
            <Table.Column title="Order ID" dataIndex={"orderId"}/>
            <Table.Column title="Package" dataIndex={"productName"} />
            <Table.Column title="Order Date" dataIndex={"orderDate"} render={date => dayjs(date).format("MMM D, YYYY - hh:mm A")} />
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

export const OrdersNew = () => {
    // Component States
    const [lastQuery, setLastQuery] = useState({});
    const [orders, setOrders] = useState([]);
    const [OrdersFetchCount, setOrdersFetchCount] = useState(0);
    const [ordersFetchError, setOrdersFetchError] = useState(null);


    useEffect(() => {
        OrderService.fetchOrders(lastQuery)
            .then((data) => {
                setOrders(data.orders);
                setOrdersFetchCount(data.count);
                setOrdersFetchError(null);
            })
            .catch(error => {
                setOrders([]);
                setOrdersFetchCount(0);
                setOrdersFetchError(error);
            });
    }, [lastQuery]);

    useEffect(() => {
        setLastQuery({ page: 1, limit: 10, orderBy: "orderDate DESC" })
    }, []);


    return (<>
        <Row>
            <Col md={24} style={{marginLeft:'5px'}}>
                <Card title={<Title level={5}>Order History</Title>}
                      headStyle={{backgroundColor:"#f0f2f5", border: 0,padding:'0px'}}>
                    <SearchForm onSearch={data => setLastQuery({ ...(data || {}), page: 1, limit: lastQuery.limit, orderBy: lastQuery.orderBy })}/>
                </Card>
            </Col>
        </Row>
        <DataView orders={orders} viewPage={lastQuery.page} viewLimit={lastQuery.limit}/>
        <Br />
        <DataPager totalPagingItems={OrdersFetchCount} currentPage={lastQuery.page}
                              onPagingChange={(page, limit) => setLastQuery({ ...lastQuery, page, limit })} />
    </>);
};
