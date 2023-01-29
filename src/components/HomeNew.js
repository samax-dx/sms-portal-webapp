import React, {useEffect, useRef, useState} from "react";
import {
    Button,
    Card,
    Col,
    Collapse,
    Divider,
    Image,
    List,
    Pagination,
    Row,
    Space,
    Statistic,
    Table,
    Tag,
    Typography,
    Progress,
    Badge,
    Modal
} from 'antd';
import Title from "antd/es/typography/Title";
import {Br} from "./Br";
import dayjs from "dayjs";
import {CampaignService} from "../services/CampaignService";
import {
    ArrowDownOutlined,
    ArrowRightOutlined, ArrowUpOutlined,
} from "@ant-design/icons";
import * as sheetjs from "xlsx";
import {Link} from "react-router-dom";
import {ProfileService} from "../services/ProfileService";
import {CampaignReportService} from "../services/CampaignReportService";
import {AccountingNew} from "../services/AccountingService";
import {InventoryService} from "../services/InventoryService";
import {SmsReportService} from "../services/SmsReportService";
import {RouteReportService} from "../services/DashBoardService/RouteReportService";
import {XAuth} from "../services/XAuth";
import {CampaignCountService} from "../services/DashBoardService/CampaignCountService";
import {CampaignSuccessCountService} from "../services/DashBoardService/CampaignSuccessCountService";
import {CampaignTaskCountService} from "../services/DashBoardService/CampaignTaskCountService";
import {render} from "react-dom";
import moment from "moment";
import getAllConfig from "../config/main";


const CompleteTaskView = ({ taskReports, viewPage, viewLimit, onView}) => {

    const [modalDataMsg, setModalDataMsg] = useState(null);
    const showModalMsg = data => setModalDataMsg(data);
    const handleOkMsg = () => setModalDataMsg(null);
    const handleCancelMsg = () => setModalDataMsg(null);

    return (<>
        <Table
            size="small"
            dataSource={taskReports}
            rowKey={(taskReport) => taskReport.phoneNumber +'_'+ taskReport.campaignId}
            locale={{ emptyText: taskReports ===null? "E": "NO DATA" }}
            pagination={false}
        >
            <Table.Column
                dataIndex={undefined}
                title={"#"}
                render={(_, __, i) => (viewPage - 1) * viewLimit + (++i)}
            />

            <Table.Column title="PhoneNumber" dataIndex={"phoneNumber"} />
            <Table.Column title="Message" dataIndex={"message"} width={"150pt"}
                          render={(v, i) =>v.length>6?<>
                              <span
                                  style={{textOverflow:"ellipsis",
                                      whiteSpace:"nowrap",
                                      maxWidth: "50pt",
                                      display: "inline-block",
                                      overflow:"hidden",
                                      verticalAlign:"middle"
                                  }}
                              >{v.replace(/\s*,\s*/g, " ")}</span>
                              <Button type="link" onClick={() => showModalMsg(v.replace(/\s*,\s*/g, " "))}>Show all</Button>
                          </>:v}/>
            <Table.Column title="Date" dataIndex={"updatedOn"} render={date => dayjs(date).format("MMM D, YYYY - hh:mm A")} />
            <Table.Column title="Campaign" dataIndex={"campaignName"} />
            <Table.Column title="Package" dataIndex={"packageId"} />
        </Table>

        <Modal title="Message" key="createCampaign" visible={!!modalDataMsg} onOk={handleOkMsg} onCancel={handleCancelMsg}>
            {modalDataMsg}
        </Modal>
    </>);
};
const PackageView = ({ products, viewPage, viewLimit, onView}) => {
    const getBalanceColor = v => ["green", "yellow", "red", "inherit"][
        [1000, 500, 0, -1].findIndex(r => v > r)
        ];

    return (<>
        <Table
            size="large"
            dataSource={products}
            rowKey={"productId"}
            locale={{ emptyText: products ===null? "E": "NO DATA" }}
            pagination={false}
            style={{ minWidth: "30vw" }}
        >
            <Table.Column
                dataIndex={undefined}
                title={"#"}
                render={(_, __, i) => (viewPage - 1) * viewLimit + (++i)}
            />

            <Table.Column title="Product Id" dataIndex={"productId"} />
            <Table.Column title="Package" dataIndex={"productName"} />
            <Table.Column title="Balance" dataIndex={"stock"} render={v => <Tag color={getBalanceColor(v)}>{v}</Tag>} />
            <Table.Column title="Prefixes" dataIndex={"dialPrefixes"} />
            <Table.Column title="Description" dataIndex={"description"} />
        </Table>
    </>);
};

const PaymentView = ({ payments, viewPage, viewLimit, onView, onEdit, onDelete }) => {
    const getBalanceColor = v => ["#87d068", "#108ee9", "#f50", "inherit"][
        [1000, 300, 0, -1].findIndex(r => v > r)
        ];

    return (<>
        <Table
            size="small"
            dataSource={payments}
            rowKey={"paymentId"}
            locale={{ emptyText: payments ===null? "E": "NO DATA" }}
            pagination={false}
            style={{ minWidth: "26vw" }}
        >
            <Table.Column title="Payment ID" dataIndex={"paymentId"} />
            <Table.Column title="Amount" dataIndex={"amount"} render={v => v.toFixed(2)&&<Tag color={getBalanceColor(v)}>{v}</Tag>} />
            <Table.Column title="Date" dataIndex={"date"} render={date => dayjs(date).format("MMM D, YYYY - hh:mm A")} />
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
export const PartyIdCatcher = () =>{
    const partyId = JSON.parse(window.atob(XAuth.token().split(".")[1]));
    return partyId.partyId;
}

export const HomeNew = () => {
    // Component States

    const [lastProfileQuery, setLastProfileQuery] = useState({});
    const [profile, setProfile] = useState({});
    const [accountBalance, setAccountBalance] = useState(0);
    const [profileFetchError, setProfileFetchError] = useState(null);

    const [lastProductQuery, setLastProductQuery] = useState({});
    const [partyProducts, setPartyProducts] = useState([]);
    const [partyProductsFetchCount, setPartyProductsFetchCount] = useState(0);
    const [partyProductsFetchError, setPartyProductsFetchError] = useState(null);

    const [lastTaskReportQuery, setLastTaskReportQuery] = useState({});
    const [taskReports, setTaskReports] = useState([]);
    const [taskReportsFetchCount, setTaskReportsFetchCount] = useState(0);
    const [taskReportsFetchError, setTaskReportsFetchError] = useState(null);

    const [lastPaymentQuery, setLastPaymentQuery] = useState({});
    const [payments, setPayments] = useState([]);
    const [paymentsFetchCount, setPaymentsFetchCount] = useState(0);
    const [paymentsFetchError, setPaymentsFetchError] = useState(null);

    const [todayCampaignCount, setTodayCampaignCount] = useState(0);
    const [weekCampaignCount, setWeekCampaignCount] = useState(0);
    const [rtCampaignCount, setRtCampaignCount] = useState('');
    const [todayCampaignSuccessCount, setTodayCampaignSuccessCount] = useState(0);
    const [weekCampaignSuccessCount, setWeekCampaignSuccessCount] = useState(0);
    const [rtCampaignSuccessCount, setRtCampaignSuccessCount] = useState(0);
    const [todayCampaignTaskCount, setTodayCampaignTaskCount] = useState(0);
    const [weekCampaignTaskCount, setWeekCampaignTaskCount] = useState(0);
    const [rtCampaignTaskCount, setRtCampaignTaskCount] = useState(0);
    const [smsStatistics, setSmsStatistics] = useState('');
    const [routeStatistics, setRouteStatistics] = useState([0]);

    useEffect(()=>{
        repetitiveApiCaller();
        setInterval(()=>{
            repetitiveApiCaller();
        },30000)
    },[])

    useEffect(() => {
        AccountingNew.fetchBalanceRequests(lastPaymentQuery)
            .then((data) => {
                console.log(data);
                setPayments(data.payments);
                setPaymentsFetchCount(data.count);
                setPaymentsFetchError(null);
            })
            .catch(error => {
                setPayments([]);
                setPaymentsFetchCount(0);
                setPaymentsFetchError(error);
            });
    }, [lastPaymentQuery]);

    useEffect(() => {
        InventoryService.fetchProducts(lastProductQuery)
            .then((data) => {
                console.log(data);
                setPartyProducts(data.products);
                setPartyProductsFetchCount(data.count);
                setPartyProductsFetchError(null);
            })
            .catch(error => {
                setPartyProducts([]);
                setPartyProductsFetchCount(0);
                setPartyProductsFetchError(error);
            });
    }, [lastProductQuery]);

    useEffect(() => {
        CampaignService.fetchCampaignTaskReports(lastTaskReportQuery)
            .then((data) => {
                console.log(data);
                setTaskReports(data.taskReports);
                setTaskReportsFetchCount(data.count);
                setTaskReportsFetchError(null);
            })
            .catch(error => {
                setTaskReports([]);
                setTaskReportsFetchCount(0);
                setTaskReportsFetchError(error);
            });
    }, [lastTaskReportQuery]);

    const repetitiveApiCaller=()=> {
        const partyId = PartyIdCatcher();

        CampaignCountService.getTodayCampaignCount({partyId})
            .then(data => {
                console.log(data);
                setTodayCampaignCount(data);
            })
            .catch(error => {
                console.log(error);
            })
        CampaignCountService.getWeekCampaignCount({partyId})
            .then(data=>{
                console.log(data);
                setWeekCampaignCount(data);
            })
            .catch(error=>{
                console.log(error);
            })
        CampaignCountService.getRtCampaignCount({partyId})
            .then(data=>{
                console.log(data);
                setRtCampaignCount(data);
            })
            .catch(error=>{
                console.log(error);
            })
        CampaignSuccessCountService.getTodayCampaignSuccessCount({partyId})
            .then(data=>{
                console.log(data);
                setTodayCampaignSuccessCount(data);
            })
            .catch(error=>{
                console.log(error);
            })
        CampaignSuccessCountService.getWeekCampaignSuccessCount({partyId})
            .then(data=>{
                console.log(data);
                setWeekCampaignSuccessCount(data);
            })
            .catch(error=>{
                console.log(error);
            })

        CampaignSuccessCountService.getRtCampaignSuccessCount({partyId})
            .then(data=>{
                console.log(data);
                setRtCampaignSuccessCount(data);
            })
            .catch(error=>{
                console.log(error);
            })

        CampaignTaskCountService.getWeekCampaignTaskCount({partyId})
            .then(data=>{
                console.log(data);
                setWeekCampaignTaskCount(data);
            })
            .catch(error=>{
                console.log(error);
            })

        CampaignTaskCountService.getTodayCampaignTaskCount({partyId})
            .then(data=>{
                console.log(data);
                setTodayCampaignTaskCount(data);
            })
            .catch(error=>{
                console.log(error);
            })

        CampaignTaskCountService.getRtCampaignTaskCount({partyId})
            .then(data=>{
                console.log(data);
                setRtCampaignTaskCount(data);
            })
            .catch(error=>{
                console.log(error);
            })

        SmsReportService.getSmsStatistics()
            .then(data=>{
                setSmsStatistics(data);
            })
            .catch(error=>{
                console.log(error);
            })

        RouteReportService.getRouteStatistics({partyId})
            .then(data=>{
                console.log(data);
                setRouteStatistics(data);
            })
            .catch(error=>{
                console.log(error);
            })

        ProfileService.fetchProfile()
            .then(data=>{
                setProfile(data.profile);
                setAccountBalance(data.balance);
            })
            .catch(error=>{
                console.log(error);
            })
    }



    useEffect(() => {
        setLastProfileQuery({ page: 1, limit: 10 })
    }, []);
    useEffect(() => {
        setLastProductQuery({ page: 1, limit: 10 })
    }, []);
    useEffect(() => {
        setLastTaskReportQuery({ page: 1, limit: 10 })
    }, []);
    useEffect(() => {
        setLastPaymentQuery({ page: 1, limit: 5 })
    }, []);


    return (<>
        <Card>
            <Row gutter={8}>
                <Col md={5}>
                    <Space direction="vertical" size={"small"}>
                        <Space direction="vertical" size={"small"}>
                            <Statistic title="Account Code No." value={profile.partyId} groupSeparator="" />
                            <Statistic title="Account Balance (BDT)" value={accountBalance} precision={2} />
                            {/*<Statistic title="Package Name" value={partyProducts.map(data=>data.productId)} />*/}
                            <Statistic title="Balance [Package]" value={partyProducts.map(data=>data.stock)} precision={2} />
                        </Space>
                    </Space>
                </Col>
                <Divider type="vertical" style={{ height: "inherit", marginRight: "24px" }} />
                <Col md={3}>
                    <Title level={3} style={{color: "#492D3A", marginLeft: 20}}>Today</Title>
                    <Space style={{marginTop: 5}}><ArrowRightOutlined style={{fontSize: 30, color: "#689dc4", marginLeft: 35}} /></Space>
                    <Title level={3} style={{color: "#492D3A", marginTop: 25}}>This Week</Title>
                    <Space style={{marginTop: 5}}><ArrowRightOutlined style={{fontSize: 30, color: "#4F995B", marginLeft: 35}} /></Space>
                </Col>

                <Col md={5}>
                    <Card style={{backgroundImage:'radial-gradient( circle 465px at -15.1% -25%,  rgba(17,130,193,1) 0%, rgba(67,166,238,1) 49%, rgba(126,203,244,1) 90.2% )'}}>
                        <Typography style={{fontSize: 22, color: '#FFFFFF'}}>Campaigns Total</Typography>
                        <Typography style={{fontSize: 24, color: '#FFFFFF', fontWeight: "bolder"}}>{todayCampaignCount}</Typography>
                    </Card>

                    <Card style={{backgroundImage:'radial-gradient( circle 465px at -15.1% -25%,  rgba(17,130,193,1) 0%, rgba(67,166,238,1) 49%, rgba(126,203,244,1) 90.2% )', marginTop: 10}}>
                        <Typography style={{fontSize: 22, color: '#FFFFFF'}}>Campaigns Total</Typography>
                        <Typography style={{fontSize: 24, color: '#FFFFFF', fontWeight: "bolder"}}>{weekCampaignCount}</Typography>
                    </Card>
                </Col>
                <Col md={5}>
                    <Card style={{backgroundImage:'radial-gradient( circle farthest-corner at 10% 20%,  rgba(226,37,37,1) 0%, rgba(211,49,49,1) 82.8% )'}}>
                        <Typography style={{fontSize: 22, color: '#FFFFFF'}}>SMS Attempt</Typography>
                        <Typography style={{fontSize: 24, color: '#FFFFFF', fontWeight: "bolder"}}>{todayCampaignTaskCount}</Typography>
                    </Card>

                    <Card style={{backgroundImage:'radial-gradient( circle farthest-corner at 10% 20%,  rgba(226,37,37,1) 0%, rgba(211,49,49,1) 82.8% )', marginTop: 10}}>
                        <Typography style={{fontSize: 22, color: '#FFFFFF'}}>SMS Attempt</Typography>
                        <Typography style={{fontSize: 24, color: '#FFFFFF', fontWeight: "bolder"}}>{weekCampaignTaskCount}</Typography>
                    </Card>
                </Col>
                <Col md={5}>
                    <Card style={{backgroundImage: 'radial-gradient( circle farthest-corner at -1% 57.5%,  rgba(0,102,43,1) 0%, rgba(19,170,82,1) 90% )'}}>
                        <Typography style={{fontSize: 22, color: '#FFFFFF'}}>Successful SMS</Typography>
                        <Typography style={{fontSize: 24, color: '#FFFFFF', fontWeight: "bolder"}}>{todayCampaignSuccessCount}</Typography>
                    </Card>

                    <Card style={{backgroundImage:'radial-gradient( circle farthest-corner at -1% 57.5%,  rgba(0,102,43,1) 0%, rgba(19,170,82,1) 90% )', marginTop: 10}}>
                        <Typography style={{fontSize: 22, color: '#FFFFFF'}}>Successful SMS</Typography>
                        <Typography style={{fontSize: 24, color: '#FFFFFF', fontWeight: "bolder"}}>{weekCampaignSuccessCount}</Typography>
                    </Card>
                </Col>
            </Row>
        </Card>
        <Card>
            <Row gutter={12}>
                <Col md={8}>
                    <Title level={5}> Real Time Performance (20 minutes) </Title>
                    <Space direction="vertical">
                        <Progress type="circle" width={100}  percent={rtCampaignCount} format={(percent) => `${percent}`}  strokeColor={"#689dc4"}/>
                        <Badge color="#689dc4" status="processing" text="Total" style={{paddingLeft: 10}}/>
                    </Space>
                    <Space direction="vertical" style={{padding: 5}}>
                        <Progress type="circle" width={100}  percent={rtCampaignTaskCount} format={(percent) => `${percent}`}  strokeColor={"Red"} />
                        <Badge color="Red" status="success" text="Attempt" style={{paddingLeft: 10}} />
                    </Space>
                    <Space direction="vertical">
                        <Progress type="circle" width={100}  percent={rtCampaignSuccessCount} format={(percent) => `${percent}`}  strokeColor={"Green"}/>
                        <Badge color="Green" status="error" text="Successful" style={{paddingLeft: 10}} />
                    </Space>

                </Col>
                <Col md={8}>
                    <Title level={5}> Route Uses </Title>
                    {/*<Progress size="medium" strokeColor={'#EE0000'} percent={routeStatistics.map(v=>v.robi?parseInt(v.robi):0)}/>*/}
                    <Progress size="medium" strokeColor={'#EE0000'} percent={parseInt(routeStatistics.find(v=>Object.keys(v)=="robi")?.robi)} format={(percent) => `${percent}`} />
                    <Progress size="medium" strokeColor={'#19AAF8'} percent={parseInt(routeStatistics.find(v=>Object.keys(v)=="grameenphone")?.grameenphone)} format={(percent) => `${percent}`} />
                    <Progress size="medium" strokeColor={'#F26522'} percent={parseInt(routeStatistics.find(v=>Object.keys(v)=="banglalink")?.banglalink)} format={(percent) => `${percent}`} />
                    <Progress size="medium" strokeColor={'#6AC537'} percent={parseInt(routeStatistics.find(v=>Object.keys(v)=="teletalk")?.teletalk)} format={(percent) => `${percent}`} />
                    <Progress size="medium" strokeColor={'#ED3D7F'} percent={parseInt(routeStatistics.find(v=>Object.keys(v)=="null")?.null)} format={(percent) => `${percent}`} />
                    <Space direction="vertical">
                        <Badge color="#EE0000" status="success" text="Robi" />
                        <Badge color="#19AAF8" status="success" text="Grameenphone" />
                    </Space>
                    <Space direction="vertical" style={{marginLeft: 15}}>
                        <Badge color="#F26522" status="success" text="Banglalink" />
                        <Badge color="#6AC537" status="success" text="Teletalk" />
                    </Space>
                    <Space direction="vertical" style={{marginLeft: 15}}>
                        <Badge color="#ED3D7F" status="success" text="Others" />
                    </Space>
                </Col>
                <Col md={8}>
                    <Title level={5}> Recent TopUp / Recharges </Title>
                    <PaymentView payments={payments} viewPage={lastPaymentQuery.page} viewLimit={lastPaymentQuery.limit} />
                    <Space children={<><p /><p /></>} />
                    <DataPager totalPagingItems={paymentsFetchCount} currentPage={lastPaymentQuery.page}
                               onPagingChange={(page, limit) => setLastPaymentQuery({ ...lastPaymentQuery, page, limit })} />
                </Col>
            </Row>
        </Card>
        <Space children={<><p /><p /></>} />
        <Space size={"large"} align="baseline">
            <Card title={<><Typography.Text style={{fontWeight: "bold", fontSize: 16}}>Active Packages</Typography.Text>&nbsp;&nbsp;<Tag color={"blue"}>{partyProductsFetchCount}</Tag></>} size="small">
                <PackageView products={partyProducts} viewPage={lastProductQuery.page} viewLimit={lastProductQuery.limit} />
                <Space children={<><p /><p /></>} />
                <DataPager totalPagingItems={partyProductsFetchCount} currentPage={lastProductQuery.page}
                           onPagingChange={(page, limit) => setLastProductQuery({ ...lastProductQuery, page, limit })} />
            </Card>
        </Space>
        <Space children={<><p /><p /></>} />
        <Card title={<Typography.Text style={{fontWeight: "bold", fontSize: 16}}>Sent Messages</Typography.Text>} size="small">
            <CompleteTaskView taskReports={taskReports} viewPage={lastTaskReportQuery.page} viewLimit={lastTaskReportQuery.limit} />
            <Space children={<><p /><p /></>} />
            <DataPager totalPagingItems={taskReportsFetchCount} currentPage={lastTaskReportQuery.page}
                       onPagingChange={(page, limit) => setLastTaskReportQuery({ ...lastTaskReportQuery, page, limit })} />
        </Card>
    </>);
};
