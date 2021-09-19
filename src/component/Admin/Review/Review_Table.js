import React, { useState, useEffect } from "react";
import { withRouter } from "react-router-dom";
import { useHistory } from "react-router";
import { Table, Button, Icon, Popconfirm } from "antd";
import { Alert_msg } from "../../Comman/alert_msg";
import Search from "antd/lib/input/Search";
import Apicall from "../../../Api/Api";

const Review_Table = (props) => {
  const history = useHistory();
  const [datas, setdata] = useState({
    page: 1,
    per_page: 10,
    search: "",
    sort: "",
    pagination:"true"
  });
  const [users, setusers] = useState([]);
  const [loading, setloading] = useState(false);
  const [paginationInfo, setPaginationInfo] = useState({
    current: 1,
    pageSize: 10,
    simple: true,
    pagination:"true"
  });
  const [serach, setsearch] = useState("");

  const handlechange = async (pagination, filters, sort) => {
    const pagiante = {
      ...datas,
      page: pagination.current || datas.page,
      search: serach,
    };

    setloading(true);
    await Apicall(pagiante, "/user/get_rates").then((res) => {
      setloading(false);
      setusers(res.data.data.rating.docs);
      setPaginationInfo({
        current: res.data.data.rating.page,
        pageSize: 10,
        total: res.data.data.rating.totalDocs,
      });
    });
  };

  const onSearch = (value) => {
    setsearch(value.target.value);
    handlechange(paginationInfo);
  };

  useEffect(() => {
    handlechange(datas);
  }, [datas]);

  const deleteuser = (id) => {
    Apicall({ id }, "/user/delete_user").then((res) => {
      handlechange(datas);
    });
  };
  const View = (id) => {
  
  };
  const columns = [
    {
      title: "Rating Type",
      width: "20%",
      render: (text, record) => {
        return <span title="Rating TYpe">{record.rating_type}</span>;
      },
    },
    {
      title: () => {
        return (
          <div>
            <div className="d-block">
              <div>Rating</div>
            </div>
          </div>
        );
      },
      width: "20%",
      render: (text, record) => {
        return (
          <span title="Rating" style={{ wordBreak: "keep-all" }}>
            {record.rating}
          </span>
        );
      },
    },
    {
      title: () => {
        return (
          <div>
            <div>Message</div>
          </div>
        );
      },
      width: "20%",
      render: (text, record) => {
        return <span title="Message">{record.message}</span>;
      },
    },
    {
      title: "Action",
      dataIndex: "operation",
      className: props?.tab_option === "delete_user" ? "d-none" : "",
      render: (text, record) =>
        users.length >= 1 ? (
          <span
            title="...."
            className="d-flex d-sm-inline justify-content-around"
          >
            <span className="cursor_point" onClick={() => View(record._id)}>
              <Icon
                type="eye"
                theme="twoTone"
                twoToneColor="#F7A400"
                className="mx-3 f_25"
              />
            </span>
          </span>
        ) : null,
    },
  ];

  return (
    <div>
      {/* <div className="mx-2 mx-sm-0 my-3">
        <Search
          size="large"
          placeholder="search"
          onKeyUp={onSearch}
          loading={false}
        />
      </div> */}
      <div id="no-more-tables">
        <Table
          rowClassName={() => "editable-row"}
          className="table_shadow"
          dataSource={users}
          rowKey={(record) => record.id}
          columns={columns}
          size="middle"
          pagination={paginationInfo}
          onChange={handlechange}
          loading={loading}
        />
      </div>
    </div>
  );
};

export default withRouter(Review_Table);
