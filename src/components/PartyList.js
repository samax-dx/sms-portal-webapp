import { useActor } from "@xstate/react";
import { Button, Input, Space, Table, Form } from "antd";


export const PartyList = ({ actor }) => {
    const [lmState, send] = useActor(actor);
    const [_parentState, sendParent] = useActor(actor.parent);

    const parties = lmState.context.result || [];
    const error = lmState.context.error;
    return (<>
        <Space>
            <Input.Search addonBefore="Name" onSearch={data => send({ type: "LOAD", data })} style={{ margin: "15px 0" }} enterButton />
        </Space>
        <Table
            size="small"
            dataSource={parties}
            pagination={{ pageSize: 3 }}
            rowKey={"partyId"}
            locale={{ emptyText: error && `[ ${error.message} ]` }}
        >
            <Table.Column
                dataIndex={undefined}
                title={"#"}
                render={(_, __, i) => i}
            />

            <Table.Column
                title="ID"
                dataIndex={undefined}
                render={(_, party, i) => {
                    return (
                        <Button onClick={() => sendParent({ type: "VIEW_ITEM", data: party })} type="link">{party.partyId}</Button>
                    );
                }}
            />

            <Table.Column title="Name" dataIndex={"groupName"} />

            <Table.Column
                dataIndex={undefined}
                title={() => (<Space>
                    <span>Actions: </span>
                    <Button
                        onClick={_ => sendParent({ type: "ADD_ITEM", data: {} })}
                        type="primary"
                        size="small"
                        style={{ verticalAlign: "middle", border: "none", borderRadius: "3px" }}
                        children={"Add Party"}
                    />
                </Space>)}
                render={(_, party, i) => (<>
                    <Button onClick={() => sendParent({ type: "EDIT_ITEM", data: party })} type="link">Edit</Button>
                    <Button onClick={_ => console.log("delete party")} type="link">Delete</Button>
                </>)}
            />
        </Table>
    </>);
};
