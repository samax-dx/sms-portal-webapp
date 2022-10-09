import {useEffect, useRef, useState} from "react";
import {
    Form,
    Input,
    Button,
    Table,
    Space,
    Pagination,
    DatePicker,
    notification,
    Collapse,
    Card,
    Select,
    Row,
    Col,
    Modal,
    Tooltip
} from "antd";
import dayjs from "dayjs";
import { useActor } from "@xstate/react";
import { Br } from "./Br";
import Title from "antd/es/typography/Title";


const SearchForm = ({ onSearch }) => {
    const [searchForm] = Form.useForm();

    const performSearch = () => {
        const formData = searchForm.getFieldsValue();

        ["date_fld0_value", "date_fld1_value"].forEach((n, i) => {
            const date = formData[n];
            formData[n] = date ? dayjs(date).add(i, "day").format("YYYY-MM-DD") : "";
        });

        const queryData = ["productName", "date_fld0_value", "date_fld1_value"].reduce((acc, v) => {
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
            wrapperCol={{ span: 20 }}
            labelAlign="left"
        >
            <Form.Item style={{display:'inline-block', margin:'0px'}} name="productName" label="Package Name" children={<Input />} />
            <Form.Item name="productName_op" initialValue={"contains"} hidden children={<Input />} />
            <Form.Item name="date_fld0_value" label="From Date" hidden children={<DatePicker format={"MMM D, YYYY"} />} />
            <Form.Item name="date_fld0_op" initialValue={"greaterThanEqualTo"} hidden children={<Input />} />
            <Form.Item style={{display:'inline-block', margin:'0px'}} name="date_fld1_value" label="To Date" hidden children={<DatePicker format={"MMM D, YYYY"} />} />
            <Form.Item name="date_fld1_op" initialValue={"lessThanEqualTo"} hidden children={<Input />} />
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

const DataView = ({ context, viewPage, viewLimit, onView, onEdit, onDelete }) => {
    const viewResult = context.result;
    const viewError = context.error;

    const [modalData, setModalData] = useState(null);
    const showModal = data => setModalData(data);
    const handleOk = () => setModalData(null);
    const handleCancel = () => setModalData(null);

    return (<>
        <Table
            style={{marginLeft:'6px',marginTop:'0px'}}
            size="small"
            dataSource={viewResult.products}
            rowKey={"productId"}
            locale={{ emptyText: viewError && `[ ${viewError.message || "Fetch Error"} ]` }}
            pagination={false}
        >
            <Table.Column
                dataIndex={undefined}
                title={"#"}
                render={(_, __, i) => (viewPage - 1) * viewLimit + (++i)}
            />

            <Table.Column title="Package" dataIndex={"productName"} />
            <Table.Column width="19%" title="Prefixes" dataIndex={"packagePrefixes"}
                          render={(v, r, i) =><>
                              <span
                                  style={{textOverflow:"ellipsis",
                                      whiteSpace:"nowrap",
                                      maxWidth: "95px",
                                      display: "inline-block",
                                      overflow:"hidden",
                                      verticalAlign:"middle"
                                  }}
                              >017,015,018,019</span>
                              <Button type="link" onClick={() => showModal(v)}>show all</Button>
                          </>} />
            <Table.Column title="Total" dataIndex={undefined} render={() => "Unknown"}/>
            <Table.Column title="Remaining" dataIndex={"stock"} />
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

export const MyPackage = ({ actor: [listLoader] }) => {
    // Component States
    const [{ context: listLoaderContext }] = useActor(listLoader);


    // Dependent Helper Functions
    const sendPagedQuery = queryData => (page, limit) => {
        page === undefined && (page = queryData.page)
        limit === undefined && (limit = queryData.limit)
        console.log(queryData, page, limit);

        const query = { data: { ...queryData, page, limit }, type: "LOAD" };
        return listLoader.send(query);
    };


    // Initializers
    useEffect(() => sendPagedQuery(listLoaderContext.payload.data)(), []);


    // Component Current Properties
    const onClickView = data => console.log("view", data);
    const onClickEdit = data => console.log("edit", data);
    const onClickDelete = data => console.log("delete", data);

    const viewPage = listLoaderContext.payload.data.page;
    const viewLimit = listLoaderContext.payload.data.limit;

    return (<>
        <Row>
            <Col md={20} style={{ marginBottom:'0px', marginLeft:'5px'}}>
                <Card title={<Title level={5}>Packages</Title>}
                      headStyle={{backgroundColor:"#f0f2f5", border: 0,padding:'0px'}} size='small'>
                    <SearchForm onSearch={data => sendPagedQuery(data)(1, viewLimit)} />
                </Card>
            </Col>
        </Row>
        <DataView context={listLoaderContext} onView={onClickView} onEdit={onClickEdit} onDelete={onClickDelete} viewPage={viewPage} viewLimit={viewLimit} />
        <Br />
        <DataPager totalPagingItems={listLoaderContext.result.count} currentPage={viewPage} onPagingChange={sendPagedQuery(listLoaderContext.payload.data)} />
    </>);
};


