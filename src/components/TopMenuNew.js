import { Button, Card, Menu, Popover, Space, Tag, Typography } from "antd";
import React, {useEffect, useState} from "react";
import {InventoryService} from "../services/InventoryService";
import {ProfileService} from "../services/ProfileService";
import {XAuth} from "../services/XAuth";
import {Link} from "react-router-dom";


const { Text } = Typography;

const QueryPager = (sender, data) => (page, limit) => {
    page === undefined && (page = data.page);
    limit === undefined && (limit = data.limit);
    console.log(data, page, limit);

    const query = { data: { ...data, page, limit }, type: "LOAD" };
    return sender(query);
};

export const TopMenuNew = () => {
    // Component States
    const [lastProfileQuery, setLastProfileQuery] = useState({});
    const [profile, setProfile] = useState({});
    const [accountBalance, setAccountBalance] = useState(0.0);
    const [profileFetchError, setProfileFetchError] = useState(null);

    const [lastProductQuery, setLastProductQuery] = useState({});
    const [partyProducts, setPartyProducts] = useState([]);
    const [partyProductsFetchCount, setPartyProductsFetchCount] = useState(0);
    const [partyProductsFetchError, setPartyProductsFetchError] = useState(null);

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

    useEffect(()=>{
        ProfileService.fetchProfile()
            .then(data=>{
                setProfile(data.profile);
                setAccountBalance(parseFloat(data.balance));
            })
    },[lastProductQuery])

    useEffect(() => {
        setLastProfileQuery({ page: 1, limit: 10 })
    }, []);

    useEffect(() => {
        setLastProductQuery({ page: 1, limit: 10 })
    }, []);


    const profileView = <Space direction="vertical">
        <div>
            <div>
                <Text type="secondary" strong>Customer-Id : </Text>
                <Text>&nbsp;{profile.partyId}</Text>
            </div>
            <div>
                <Text type="secondary" strong>User ID : </Text>
                <Text>&nbsp;{profile.loginId}</Text>
            </div>
        </div>
        <Button size="small" onClick={() => void (XAuth.logout()) || window.location.reload()}><Text type="warning">logout</Text></Button>
    </Space>;

    return (
        <Menu
            mode="horizontal"
            className="menu"
        >
            <Popover content={profileView}>
                <Menu.Item key="profile">
                    <Link to="/userProfile" style={{color:"white"}}>{profile.name}</Link>
                </Menu.Item>
            </Popover>
            <Menu.Item key="balance" className="balanceView"><strong>Balance (main): {accountBalance.toFixed(2)} BDT</strong></Menu.Item>
            {partyProducts.map(product => <Menu.Item key={product.productId} className="balanceView"><strong>Balance ({product.productId}): {product.stock}</strong></Menu.Item>)}
        </Menu>
    );
}
