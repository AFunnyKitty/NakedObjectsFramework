﻿// Copyright Naked Objects Group Ltd, 45 Station Road, Henley on Thames, UK, RG9 1AT
// Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. 
// You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
// Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and limitations under the License.

using System;
using System.Data.Entity;
using System.Data.Entity.SqlServer;
using System.Linq;
using Microsoft.Practices.Unity;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using NakedObjects.Boot;
using NakedObjects.Core.NakedObjectsSystem;
using NakedObjects.EntityObjectStore;
using NakedObjects.Helpers.Test.ViewModel;
using NakedObjects.Services;
using NakedObjects.SystemTest.PolymorphicAssociations;
using NakedObjects.SystemTest.TestObjectFinderWithCompoundKeysAndTypeCodeMapper;
using NakedObjects.Xat;

namespace NakedObjects.SystemTest.PolymorphicNavigatorWithTypeCodeMapper {
    public class DatabaseInitializer : DropCreateDatabaseAlways<MyContext> {}


    [TestClass, Ignore]
    public class TestPolymorphicNavigatorWithTypeCodeMapper : AcceptanceTestCase {
        #region Setup/Teardown

        // to get EF SqlServer Dll in memory
        public SqlProviderServices instance = SqlProviderServices.Instance;

        protected override void RegisterTypes(IUnityContainer container) {
            base.RegisterTypes(container);
            var config = new EntityObjectStoreConfiguration {EnforceProxies = false};
            config.UsingCodeFirstContext(() => new PaymentContext("HelpersTest"));
            container.RegisterInstance(config, (new ContainerControlledLifetimeManager()));
        }

        [ClassInitialize]
        public static void SetupTestFixture(TestContext tc) {
            Database.SetInitializer(new DatabaseInitializer());
            InitializeNakedObjectsFramework(new TestViewModel());
        }

        [ClassCleanup]
        public static void TearDownTest() {
            CleanupNakedObjectsFramework(new TestViewModel());
        }

        [TestInitialize]
        public void Initialize() {
            StartTest();
        }

        [TestCleanup]
        public void CleanUp() {}

        #endregion

        #region Run configuration

        protected override IServicesInstaller MenuServices {
            get {
                return new ServicesInstaller(
                    new SimpleRepository<PolymorphicPayment>(),
                    new SimpleRepository<CustomerAsPayee>(),
                    new SimpleRepository<SupplierAsPayee>(),
                    new SimpleRepository<InvoiceAsPayableItem>(),
                    new SimpleRepository<ExpenseClaimAsPayableItem>());
            }
        }

        protected override IServicesInstaller SystemServices {
            get { return new ServicesInstaller(new Services.PolymorphicNavigator(), new SimpleTypeCodeMapper()); }
        }

        #endregion

        [TestMethod]
        public void SetPolymorphicProperty() {
            ITestObject payment1 = GetTestService("Polymorphic Payments").GetAction("New Instance").InvokeReturnObject();

            ITestObject customer1 = GetTestService("Customer As Payees").GetAction("New Instance").InvokeReturnObject().Save();
            string cusId = customer1.GetPropertyByName("Id").Title;

            ITestProperty payeeProp = payment1.GetPropertyByName("Payee");
            ITestProperty payeeLinkProp = payment1.GetPropertyByName("Payee Link").AssertIsUnmodifiable().AssertIsEmpty();
            payeeProp.SetObject(customer1);
            payment1.Save();
            ITestObject payeeLink = payeeLinkProp.AssertIsNotEmpty().ContentAsObject;
            ITestProperty associatedType = payeeLink.GetPropertyByName("Associated Role Object Type").AssertIsUnmodifiable();
            associatedType.AssertValueIsEqual("CUS");
            ITestProperty associatedId = payeeLink.GetPropertyByName("Associated Role Object Id").AssertIsUnmodifiable();
            associatedId.AssertValueIsEqual(cusId);

            ITestObject sup1 = GetTestService("Supplier As Payees").GetAction("New Instance").InvokeReturnObject().Save();
            string supId = sup1.GetPropertyByName("Id").Title;

            payeeProp.SetObject(sup1);
            associatedType.AssertValueIsEqual("SUP");
            associatedId.AssertValueIsEqual(supId);

            payeeProp.ClearObject();
            payeeLinkProp.AssertIsEmpty();
            payeeProp.AssertIsEmpty();
        }

        [TestMethod]
        public void ClearPolymorphicProperty() {
            ITestObject payment1 = GetTestService("Polymorphic Payments").GetAction("New Instance").InvokeReturnObject();

            ITestObject customer1 = GetTestService("Customer As Payees").GetAction("New Instance").InvokeReturnObject().Save();
            ITestProperty payeeProp = payment1.GetPropertyByName("Payee");
            ITestProperty payeeLinkProp = payment1.GetPropertyByName("Payee Link");
            payeeProp.SetObject(customer1);
            payment1.Save();
            payeeLinkProp.AssertIsNotEmpty();
            payeeProp.AssertIsNotEmpty();

            payeeProp.ClearObject();
            payeeLinkProp.AssertIsEmpty();
            payeeProp.AssertIsEmpty();
        }

        [TestMethod]
        public void PolymorphicCollection() {
            ITestObject payment = GetTestService("Polymorphic Payments").GetAction("New Instance").InvokeReturnObject().Save();

            ITestObject inv = GetTestService("Invoice As Payable Items").GetAction("New Instance").InvokeReturnObject().Save();
            string invId = inv.GetPropertyByName("Id").Title;
            ITestObject exp = GetTestService("Expense Claim As Payable Items").GetAction("New Instance").InvokeReturnObject().Save();
            string expId = exp.GetPropertyByName("Id").Title;

            ITestCollection links = payment.GetPropertyByName("Payable Item Links").ContentAsCollection;
            ITestProperty items = payment.GetPropertyByName("Payable Items");

            links.AssertCountIs(0);
            items.ContentAsCollection.AssertCountIs(0);

            //Add an Invoice
            payment.GetAction("Add Payable Item").InvokeReturnObject(inv);
            links.AssertCountIs(1);
            ITestObject link1 = links.ElementAt(0);
            link1.GetPropertyByName("Associated Role Object Type").AssertValueIsEqual("INV");
            link1.GetPropertyByName("Associated Role Object Id").AssertValueIsEqual(invId);
            ITestObject item = items.ContentAsCollection.AssertCountIs(1).ElementAt(0);
            item.AssertIsType(typeof (InvoiceAsPayableItem));

            //Add an expense claim
            payment.GetAction("Add Payable Item").InvokeReturnObject(exp);
            links.AssertCountIs(2);
            ITestObject link2 = links.ElementAt(1);
            link2.GetPropertyByName("Associated Role Object Type").AssertValueIsEqual("EXP");
            link2.GetPropertyByName("Associated Role Object Id").AssertValueIsEqual(expId);
            item = items.ContentAsCollection.AssertCountIs(2).ElementAt(1);
            item.AssertIsType(typeof (ExpenseClaimAsPayableItem));

            //Now remove the invoice
            payment.GetAction("Remove Payable Item").InvokeReturnObject(inv);
            links.AssertCountIs(1);
            link1 = links.ElementAt(0);
            link1.GetPropertyByName("Associated Role Object Type").AssertValueIsEqual("EXP");
            link1.GetPropertyByName("Associated Role Object Id").AssertValueIsEqual(expId);
            item = items.ContentAsCollection.AssertCountIs(1).ElementAt(0);
            item.AssertIsType(typeof (ExpenseClaimAsPayableItem));

            //Try adding same expense claim again
            payment.GetAction("Add Payable Item").InvokeReturnObject(exp);
            links.AssertCountIs(1); //Should still be 1
            link1 = links.ElementAt(0);
            link1.GetPropertyByName("Associated Role Object Type").AssertValueIsEqual("EXP");
            link1.GetPropertyByName("Associated Role Object Id").AssertValueIsEqual(expId);
            item = items.ContentAsCollection.AssertCountIs(1).ElementAt(0);
            item.AssertIsType(typeof (ExpenseClaimAsPayableItem));
        }
    }

    public class SimpleTypeCodeMapper : ITypeCodeMapper {
        #region ITypeCodeMapper Members

        public Type TypeFromCode(string code) {
            if (code == "CUS") return typeof (CustomerAsPayee);
            if (code == "SUP") return typeof (SupplierAsPayee);
            if (code == "INV") return typeof (InvoiceAsPayableItem);
            if (code == "EXP") return typeof (ExpenseClaimAsPayableItem);
            throw new DomainException("Code not recognised: " + code);
        }

        public string CodeFromType(Type type) {
            if (type == typeof (CustomerAsPayee)) return "CUS";
            if (type == typeof (SupplierAsPayee)) return "SUP";
            if (type == typeof (InvoiceAsPayableItem)) return "INV";
            if (type == typeof (ExpenseClaimAsPayableItem)) return "EXP";
            throw new DomainException("Type not recognised: " + type);
        }

        #endregion
    }
}