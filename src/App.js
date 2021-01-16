import './App.css';
import React, { Component } from 'react';
import { Table, Button } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
const columns = [
  {
    title: '权限名称',
    dataIndex: 'authName',
    key: 'authName',
  },
];
let leftData = [
  { id: 1, authName: "办公管理", pid: 0 },
  { id: 4, authName: "请假申请", pid: 1 },
  { id: 3, authName: "出差申请", pid: 1 },
  { id: 5, authName: "系统设置", pid: 0 },
  { id: 6, authName: "管理", pid: 5 },
  { id: 8, authName: "哈哈", pid: 5 },
  { id: 7, authName: "管理", pid: 6 },
]
let rightData = [
  { id: 1, authName: "办公管理", pid: 0 },
  { id: 2, authName: "申请", pid: 1 },
  { id: 10, authName: "出差", pid: 1 },
  { id: 5, authName: "系统设置", pid: 0 },
  { id: 6, authName: "管理", pid: 5 },
  { id: 67, authName: "权限", pid: 6 },
]
const makeElementTree = (params) => {
  // 将参数拿出来，不喜欢 params.xxx 的调用方式
  const { pid, list, pidFiled, labelFiled, valueFiled } = params
  // 构建一个内部函数，用于实现递归
  const makeTree = (pid, arr) => {
    const res = []
    arr.forEach(i => {
      if (i[pidFiled] === pid) {
        // 自己调用自己，递归查归属于自己的 children
        const children = makeTree(i[valueFiled], list)
        // 将原有的数据按照 element 的格式进行重构
        const obj = {
          pid,
          id: i.id,
          authName: i[labelFiled],
          key: i.id,
        }
        // 如果有 children 则插入 obj 中
        if (children.length) {
          obj.children = children
        }
        res.push(obj)
      }
    })
    return res
  }
  return makeTree(pid, list)
}
const treeCats = (data) => makeElementTree({
  pid: 0,               // 顶级分类的 pid 为 0
  list: JSON.parse(JSON.stringify(data)),           // 将原始数组参数穿进去
  pidFiled: 'pid', // 在数组对象中，pid 字段名为 parentId
  labelFiled: 'authName',// 我们想要的 label 字段名为 catname
  valueFiled: 'id'   // 我们想要的 value 字段名为 catid
})
// const RemoveSameItem = (listOne, listTwo) => {
//   return listOne.filter((i) => !listTwo.find((j) => j.id === i.id)).concat( listTwo.filter((i) => !listOne.find((j) => j.id === i.id)) )
// }
const unique = (direction, data, selectData) => {
  let arr = JSON.parse(JSON.stringify(data));
  for (let i = 0; i < selectData.length; i++) {
    const index = arr.findIndex((item) => item.id === selectData[i].id);
    if (direction === 'left') {
      if (index > -1) arr.splice(index, 1);
    }
    else {
      if (index === -1) arr.push(selectData[i]);
    }
    continue;
  }
  return arr;
}

class CustomTransfer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      checkStrictly: false,
      leftClickData: [],
      rightClickData: [],
      leftClickIndex: 0,
      rightClickIndex: 0,
      newLeftData: treeCats(leftData),
      newRightData: treeCats(rightData), 
      leftSelectedRowKeys: [],
      rightSelectedRowKeys: [],
    };
  };
  familyTree = (sourceData, pid) => {
    const temp = [];
    function forFn(arr, id) {
      for (let i = 0; i < arr.length; i++) {
        if (arr[i].id === id) {
          temp.push(arr[i]);
          if (arr[i].pid !== 0) forFn(sourceData, arr[i].pid);
          break;
        }
      }
    }
    forFn(sourceData, pid);
    return temp;
  };
  handleMove = (direction) => {
    const { leftClickData, rightClickData } = this.state;
    const isToRight = direction === 'toRight';
    const selectedData = JSON.parse(JSON.stringify(isToRight ? leftClickData : rightClickData));
    const leftSelectedData = JSON.parse(JSON.stringify(selectedData));
    const rightSelectedData = JSON.parse(JSON.stringify(selectedData));
    const sourceData = isToRight ? leftData : rightData;
    leftSelectedData.forEach(({ pid }) => {
      if (pid !== 0 && !rightSelectedData.findIndex((item) => item.pid === pid)) leftSelectedData.push(...this.familyTree(sourceData, pid));
    });
    let resultLeft = unique(isToRight ? 'left' : 'right', leftData, isToRight ? rightSelectedData : leftSelectedData);
    let resultRight = unique(isToRight ? 'right' : 'left', rightData, isToRight ? leftSelectedData : rightSelectedData);
    leftData = resultLeft;
    rightData = resultRight;
    this.setState({
      leftSelectedRowKeys: [],
      rightSelectedRowKeys: [],
      newLeftData: resultLeft.length ? treeCats(resultLeft) : [],
      newRightData: resultRight.length ? treeCats(resultRight) : [],
    });
  }
  render() {
    const { checkStrictly, newLeftData, newRightData, leftSelectedRowKeys, rightSelectedRowKeys } = this.state;
    const leftRowSelection = {
      selectedRowKeys: leftSelectedRowKeys,
      onChange: (selectedRowKeys, selectedRows) => {
        this.setState({
          leftSelectedRowKeys: selectedRowKeys,
          leftClickData: selectedRows,
        });
      },
      getCheckboxProps:(record) => {
        return {
          disabled: record.disabled ===true, // 配置默认禁用的选项 含有孩子节点的字段名称为child =true
        };
      },
    };
    const rightRowSelection = {
      selectedRowKeys: rightSelectedRowKeys,
      onChange: (selectedRowKeys, selectedRows) => {
        this.setState({
          rightSelectedRowKeys: selectedRowKeys,
          rightClickData: selectedRows,
        });
      },
      getCheckboxProps:(record) => {
        return {
          disabled: record.disabled ===true, // 配置默认禁用的选项 含有孩子节点的字段名称为child =true
        };
      },
    };
    return(
      <div className="ant-transfer ant-transfer-customize-list">
        <div className="ant-transfer-list">
          <div className="ant-transfer-list-header">
            <span className="ant-transfer-list-header-text">未分发</span>
          </div>
          <div className="ant-transfer-list-body">
            <div className="ant-transfer-list-body-customize-wrapper">
              <Table
                columns={columns}
                rowSelection={{ ...leftRowSelection, checkStrictly }}
                dataSource={newLeftData}
                pagination={false}
                defaultExpandAllRows={true}
              />
            </div>
          </div>
        </div>
        <div className="ant-transfer-operation">
          <Button type="primary" size="small" disabled={!leftSelectedRowKeys.length} onClick={this.handleMove.bind(this, 'toRight')}><RightOutlined /></Button>
          <Button type="primary" size="small" disabled={!rightSelectedRowKeys.length} onClick={this.handleMove.bind(this, 'toLeft')}><LeftOutlined /></Button>
        </div>
        <div className="ant-transfer-list">
          <div className="ant-transfer-list-header">
            <span className="ant-transfer-list-header-text">已分发</span>
          </div>
          <div className="ant-transfer-list-body">
            <div className="ant-transfer-list-body-customize-wrapper">
              <Table
                columns={columns}
                rowSelection={{ ...rightRowSelection, checkStrictly }}
                dataSource={newRightData}
                pagination={false}
                defaultExpandAllRows={true}
              />
            </div>
          </div>
        </div>
      </div>
    )
  }
}
export default CustomTransfer;