import React from 'react'
import {Button, DatePicker, Form, Input} from "antd";
import dayjs from "dayjs";


export const TaskSearchForm = ({ onSearch }) => {
  const [searchForm] = Form.useForm();

  const performSearch = () => {// {[fieldName]: value}
    const formData = searchForm.getFieldsValue();

    ["cratedOn_fld0_value", "cratedOn_fld1_value"].forEach((n, i) => {
      const date = formData[n];
      formData[n] = date ? dayjs(date).add(i, "day").format("YYYY-MM-DD") : "";
    });

    const queryData = ["phoneNumber", "cratedOn_fld0_value", "cratedOn_fld1_value"].reduce((acc, v) => {
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
        labelCol={{ span: 22 }}
        wrapperCol={{ span: 23 }}
        labelAlign="left"
    >
      <Form.Item style={{display:'inline-block', margin:'0px'}} name="phoneNumber" label="Campaign Phone Number" children={<Input />} />
      <Form.Item name="phoneNumber_op" initialValue={"contains"} hidden children={<Input />} />
      {/*<Form.Item style={{display:'inline-block', margin:'0px'}} name="cratedOn_fld0_value" label="From Date" children={<DatePicker format={"MMM D, YYYY"} />} />
      <Form.Item name="cratedOn_fld0_op" initialValue={"greaterThanEqualTo"} hidden children={<Input />} />
      <Form.Item style={{display:'inline-block', margin:'0px'}} name="cratedOn_fld1_value" label="To Date" children={<DatePicker format={"MMM D, YYYY"} />} />
      <Form.Item name="cratedOn_fld1_op" initialValue={"lessThanEqualTo"} hidden children={<Input />} />*/}
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
