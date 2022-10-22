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
    Modal, Typography, DatePicker, notification, Spin
} from "antd";
import Title from "antd/es/typography/Title";
import {Br} from "./Br";
import dayjs from "dayjs";
import {ProductService} from "../services/ProductService";
import {OrderService} from "../services/OrderService";


const SearchForm = ({onSearch}) => {
    const [searchForm] = Form.useForm();

    const performSearch = () => {
        const formData = searchForm.getFieldsValue();

        ["date_fld0_value", "date_fld1_value"].forEach((n, i) => {
            const date = formData[n];
            formData[n] = date ? dayjs(date).add(i, "day").format("YYYY-MM-DD") : "";
        });

        const queryData = ["productName", "dialPrefixes", "date_fld0_value", "date_fld1_value"].reduce((acc, v) => {
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
            labelCol={{span: 15}}
            wrapperCol={{span: 23}}
            labelAlign="left"
        >
            <Form.Item style={{display: 'inline-block', margin: '0px'}} name="productName" label="Name"
                       children={<Input/>}/>
            <Form.Item name="productName_op" initialValue={"contains"} hidden children={<Input/>}/>
            <Form.Item style={{display: 'inline-block', margin: '0px'}} name="dialPrefixes" label="Prefix"
                       children={<Input/>}/>
            <Form.Item name="dialPrefixes_op" initialValue={"contains"} hidden children={<Input/>}/>
            <Form.Item name="date_fld0_value" label="From Date" hidden children={<DatePicker format={"MMM D, YYYY"}/>}/>
            <Form.Item name="date_fld0_op" initialValue={"greaterThanEqualTo"} hidden children={<Input/>}/>
            <Form.Item style={{display: 'inline-block', margin: '0px'}} name="date_fld1_value" label="To Date" hidden
                       children={<DatePicker format={"MMM D, YYYY"}/>}/>
            <Form.Item name="date_fld1_op" initialValue={"lessThanEqualTo"} hidden children={<Input/>}/>
            <Form.Item style={{display: 'inline-block', margin: '0px'}} wrapperCol={{offset: 4}} colon={false}
                       label=' '>
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

const DataView = ({products, viewPage, viewLimit}) => {
    const [spinning, setSpinning] = useState(false);

    return (
        <Spin spinning={spinning} size={"large"}>
            <Table
                style={{marginLeft: '6px'}}
                size="small"
                dataSource={products}
                rowKey={"productId"}
                locale={{emptyText: products === null ? "E" : "NO DATA"}}
                pagination={false}
            >
                <Table.Column
                    dataIndex={undefined}
                    title={"#"}
                    render={(_, __, i) => (viewPage - 1) * viewLimit + (++i)}
                />
                <Table.Column title="Package Name" dataIndex={"productName"}/>
                <Table.Column title="Prefixes" dataIndex={"dialPrefixes"} render={(v, r, i) => v.replace(/\s*,\s*/g, ", ")}/>
                <Table.Column title="Volume" dataIndex={"volume"}/>
                <Table.Column title="Price" dataIndex={"price"}/>
                <Table.Column title="Details" dataIndex={"description"}/>

                <Table.Column
                    dataIndex={undefined}
                    render={(_, product, i) => (
                        <Button
                            onClick={() => setSpinning(true) || OrderService
                                .createOrder({...product, quantity: 1})
                                .then(order => {
                                    setSpinning(false);
                                    notification.success({
                                        key: `corder_${Date.now()}`,
                                        message: "Task Complete",
                                        description: <>Order created: {order.orderId}</>,
                                        duration: 5
                                    });
                                })
                                .catch(error => {
                                    setSpinning(false) || notification.error({
                                        key: `corder_${Date.now()}`,
                                        message: "Task Failed",
                                        description: <>Error placing order.<br/>{error.message}</>,
                                        duration: 5
                                    });
                                })
                            }
                            type="primary"
                        >Buy Package</Button>
                    )}
                />
            </Table>
        </Spin>
    );
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

export const BuyPackageNew = () => {
    // Component States
    const [lastQuery, setLastQuery] = useState({});
    const [products, setProducts] = useState([]);
    const [ProductsFetchCount, setProductsFetchCount] = useState(0);
    const [productsFetchError, setProductsFetchError] = useState(null);


    useEffect(() => {
        ProductService.fetchProducts(lastQuery)
            .then((data) => {
                console.log(data)
                setProducts(data.products);
                setProductsFetchCount(data.count);
                setProductsFetchError(null);
            })
            .catch(error => {
                setProducts([]);
                setProductsFetchCount(0);
                setProductsFetchError(error);
            });
    }, [lastQuery]);

    useEffect(() => {
        setLastQuery({page: 1, limit: 10})
    }, []);


    return (<>
        <Row>
            <Col md={24} style={{marginLeft: '5px'}}>
                <Card title={<Title level={5}>Packages</Title>}
                      headStyle={{backgroundColor: "#f0f2f5", border: 0, padding: '0px'}} size='small'>
                    <SearchForm onSearch={data => setLastQuery({...(data || {}), page: 1, limit: lastQuery.limit})}/>
                </Card>
            </Col>
        </Row>
        <DataView products={products} viewPage={lastQuery.page} viewLimit={lastQuery.limit}/>
        <Br/>
        <DataPager totalPagingItems={ProductsFetchCount} currentPage={lastQuery.page}
                   onPagingChange={(page, limit) => setLastQuery({...lastQuery, page, limit})}/>
    </>);
};
