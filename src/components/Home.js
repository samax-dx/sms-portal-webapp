import {Button, Card, Col, Collapse, Row, Space, Statistic} from 'antd';
import {Dashboard} from "./Dashboard";
import {PaymentInstrument} from "./paymentInstrument";


export const Home = props => {
    return (

        <Space direction="vertical" size="middle" style={{display: 'flex'}}>
            <Card title="Card" size="small">
                <Row gutter={16}>
                    <Col span={12}>
                        <Statistic title="Account Balance (BDT)" value={112893} precision={2}/>
                        <Button style={{marginTop: 16}} type="primary">
                            Recharge
                        </Button>


                        <PaymentInstrument/>


                    </Col>
                    <Col span={12}>
                        <Statistic title="Total SMS Purchased" value={112893}/>
                    </Col>
                </Row>
            </Card>
            <Card title="Card" size="small">
                <div>

                    <Card title="Package Status" extra={<a href="#">More</a>} style={{width: 1200}}>
                        {/*<p>Card content</p>
                    <p>Card content</p>
                    <p>Card content</p>*/}

                        <Dashboard/>
                    </Card>


                </div>
            </Card>

        </Space>

);
};
