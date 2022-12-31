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
import {Inventory as InventoryService} from "../services/Inventory";
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

        const queryData = ["productName", "orderDate_fld0_value", "orderDate_fld1_value"].reduce((acc, v) => {
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
            initialValues={{ date_fld0_value: moment().subtract(1, 'days'), date_fld1_value:moment(new Date()) }}
        >
            <Form.Item style={{display:'inline-block', margin:'0px'}} name="productName" label="Package Name" children={<Input />} />
            <Form.Item name="productName_op" initialValue={"contains"} hidden children={<Input />} />
            <Form.Item style={{display:'inline-block', margin:'0px'}} name="date_fld0_value" label="From Date" children={<DatePicker showTime use12Hours={true} format="YYYY-MM-DD HH:mm:ss" />} />
            <Form.Item name="date_fld0_op" initialValue={"greaterThanEqualTo"} hidden children={<Input />} />
            <Form.Item style={{display:'inline-block', margin:'0px'}} name="date_fld1_value" label="To Date" children={<DatePicker showTime use12Hours={true} format="YYYY-MM-DD HH:mm:ss" />} />
            <Form.Item name="date_fld1_op" initialValue={"lessThanEqualTo"} hidden children={<Input />} />
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

const DataView = ({ products, viewPage, viewLimit}) => {

    const [modalData, setModalData] = useState(null);
    const showModal = data => setModalData(data);
    const handleOk = () => setModalData(null);
    const handleCancel = () => setModalData(null);

    return (<>
        <Table
            style={{marginLeft:'6px'}}
            size="small"
            dataSource={products}
            rowKey={"productId"}
            locale={{ emptyText: products ===null? "E": "NO DATA" }}
            pagination={false}
        >
            <Table.Column
                dataIndex={undefined}
                title={"#"}
                render={(_, __, i) => (viewPage - 1) * viewLimit + (++i)}
            />
            <Table.Column title="Package" dataIndex={"productName"} />
            <Table.Column width="19%" title="Prefixes" dataIndex={"dialPrefixes"}
                          render={(v, r, i) =><>
                              <span
                                  style={{textOverflow:"ellipsis",
                                      whiteSpace:"nowrap",
                                      maxWidth: "95px",
                                      display: "inline-block",
                                      overflow:"hidden",
                                      verticalAlign:"middle"
                                  }}
                              >{v.replace(/\s*,\s*/g, ", ")}</span>
                              <Button type="link" onClick={() => showModal(v.replace(/\s*,\s*/g, ", "))}>Show all</Button>
                          </>} />
            <Table.Column title="Balance" dataIndex={"stock"} />
            <Table.Column title="Details" dataIndex={"description"} />
        </Table>
        <Modal title="Package Prefixes" key="createCampaign" visible={!!modalData} onOk={handleOk} onCancel={handleCancel}>
            {modalData}
        </Modal>
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

export const MyPackageNew = () => {
    // Component States
    const [lastQuery, setLastQuery] = useState({});
    const [products, setProducts] = useState([]);
    const [ProductsFetchCount, setProductsFetchCount] = useState(0);
    const [productsFetchError, setProductsFetchError] = useState(null);


    useEffect(() => {
        InventoryService.fetchProducts({}, { data: lastQuery })
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
        setLastQuery({ page: 1, limit: 10 })
    }, []);


    return (<>
        <Row>
            <Col md={24} style={{marginLeft:'5px'}}>
                <Card title={<Title level={5}>Packages</Title>}
                      headStyle={{backgroundColor:"#f0f2f5", border: 0,padding:'0px'}}>
                    <SearchForm onSearch={data => setLastQuery({ ...(data || {}), page: 1, limit: lastQuery.limit, orderBy: lastQuery.orderBy })}/>
                </Card>
            </Col>
        </Row>
        <DataView products={products} viewPage={lastQuery.page} viewLimit={lastQuery.limit}/>
        <Br />
        <DataPager totalPagingItems={ProductsFetchCount} currentPage={lastQuery.page}
                              onPagingChange={(page, limit) => setLastQuery({ ...lastQuery, page, limit })} />
    </>);
};
