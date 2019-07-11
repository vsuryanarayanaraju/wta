import React, { Suspense } from 'react';
import logo from './logo.svg';
import './App.css';
import { thisExpression } from '@babel/types';

class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      allProducts: [],
      headers: ['price', 'name', 'veg_nonveg', 'count'],
      loadData: false,
      pageNo: 1,
      pageSize: 10,
      searchTerm: '',
      isAdvanced: false,
      advancedFilter: '',
      sort: false,
      product: ''
    }
  }

  async componentDidMount() {
    await fetch('http://ec2-52-66-204-184.ap-south-1.compute.amazonaws.com:8080/v1.0/admin/catalog/products').then(response => response.json())
      .then(resp => {
        this.setState({ allProducts: resp.data })
      })
    this.setState({ loadData: true })
  }

  // tableHeaderQuery(obj){
  //   console.log(obj)
  // }


  // )

  loadMore = () => {
    const { pageNo } = this.state

    this.setState({
      pageNo: pageNo + 1
    })
  };

  sort(ele, products,flag) {
    let obj = products.sort(this.dynamicSort(ele,flag))
    this.setState({ product: obj, sort: true })
  }


  dynamicSort(property,flag) {
    var sortOrder = flag;
    if(!flag){
      property = property.substr(1)
    }
    return function (a, b) {
      var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
      return result * sortOrder;
    }
  }

  renderAdvancedSearch = () => {
    if (this.state.isAdvanced) {
      return (<div className="col-sm-3">
        <div className="form-group">
          <label>Enter price range <small>(Ex: 10-20)</small></label>
          <input type="text" className="form-control" onChange={(event) => {
            this.setState({
              advancedFilter: event.target.value
            })
          }} />
        </div>
      </div>)
    }
    else {
      return null
    }
  }

  content() {
    const { searchTerm, advancedFilter, sort } = this.state;

    let products = this.state.allProducts.slice(0, this.state.pageNo * this.state.pageSize);

    if (searchTerm) {
      products = products.filter(ele => new RegExp(searchTerm, 'ig').test(ele.name))
    }

    if (sort) {
      products = this.state.product
    }

    if (advancedFilter) {
      let _price = advancedFilter.split('-');
      products = products.filter(ele => ele.price >= _price[0] && ele.price <= _price[1])
    }

    return (
      <div className="container-fluid">
        <div className="m-5">
          <div className="card">
            <div className="card-header">
              <div className="row d-flex align-items-baseline">
                <div className="col-sm-3">
                  <div className="form-group">
                    <label>Enter product name</label>
                    <input type="text" className="form-control" value={searchTerm} onChange={(event) => {
                      this.setState({ searchTerm: event.target.value })
                    }} />
                  </div>
                </div>
                {
                  this.renderAdvancedSearch()

                }
                <div className="col-sm-2">
                  <p className="m-2">&nbsp;</p>
                  <button className="btn btn-primary" onClick={() => {
                    this.setState({ isAdvanced: !this.state.isAdvanced, advancedFilter: '' });
                  }}>{this.state.isAdvanced ? 'Clear Filter' : 'Advanced Filter'}</button>
                </div>
              </div>
            </div>
          </div>
          <table className="table table-striped table-bordered" style={{ width: "100%" }}>
            <thead >
              <tr>
                <th>S.No</th>
                {this.state.headers.map((ele, i) =>
                  <th style ={{cursor:'pointer'}} key={`header${i}`}>{ele} {<span style={{paddingLeft:'40px'}} onClick={() => this.sort(ele, products,1)}>↑</span>}{<span style={{paddingLeft:'20px'}} onClick={() => this.sort(ele, products,-1)}>↓</span>}</th>)}
              </tr>
            </thead>
            <tbody>
              {
                products.map((ele, i) => (
                  <tr key={`row ${i}`}>
                    <td>{i + 1}</td>
                    {
                      this.state.headers.map((header, j) => (
                        <td key={`row${i}column${j}`}>{ele[header]},</td>
                      ))
                    }
                  </tr>
                ))
              }
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={this.state.headers.length + 1}>
                  <button className="btn btn-primary btn-block" onClick={this.loadMore}>Loadmore</button>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>)
  }

  render() {
    return (
      <div>
        {this.state.loadData ? this.content() : null}
      </div>)
  }
}


export default App;
