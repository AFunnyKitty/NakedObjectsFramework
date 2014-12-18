// Copyright Naked Objects Group Ltd, 45 Station Road, Henley on Thames, UK, RG9 1AT
// Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. 
// You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
// Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and limitations under the License.

using System;
using System.Globalization;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;
using NakedObjects.Architecture;
using NakedObjects.Architecture.Spec;
using NakedObjects.Architecture.SpecImmutable;
using NakedObjects.Meta.SemanticsProvider;

namespace NakedObjects.Meta.Test.SemanticsProvider {
    [TestClass]
    public class FloatValueSemanticsProviderTest : ValueSemanticsProviderAbstractTestCase<float> {
        #region Setup/Teardown

        [TestInitialize]
        public override void SetUp() {
            base.SetUp();

            holder = new Mock<ISpecification>().Object;
            var spec = new Mock<IObjectSpecImmutable>().Object;
            SetValue(new FloatValueSemanticsProvider(spec, holder));

            floatObj = 32.5F;
        }

        [TestCleanup]
        public override void TearDown() {
            base.TearDown();
        }

        #endregion

        private Single floatObj;

        private ISpecification holder;

        [TestMethod]
        public void TestDecode() {
            float decoded = GetValue().FromEncodedString("3.042112234E6");
            Assert.AreEqual(3042112.234f, decoded);
        }

        [TestMethod]
        public void TestEncode() {
            string encoded = GetValue().ToEncodedString(0.0000454566f);
            Assert.AreEqual("4.54566E-05", encoded);
        }

        [TestMethod]
        public void TestInvalidParse() {
            try {
                GetValue().ParseTextEntry("one");
                Assert.Fail();
            }
            catch (Exception e) {
                Assert.IsInstanceOfType(e, typeof (InvalidEntryException));
            }
        }

        [TestMethod]
        public void TestParse() {
            object newValue = GetValue().ParseTextEntry("120.56");
            Assert.AreEqual(120.56F, newValue);
        }

        [TestMethod]
        public void TestParse2() {
            object newValue = GetValue().ParseTextEntry("1,20.0");
            Assert.AreEqual(120F, newValue);
        }

        [TestMethod]
        public override void TestParseEmptyString() {
            try {
                object newValue = GetValue().ParseTextEntry("");
                Assert.IsNull(newValue);
            }
            catch (Exception) {
                Assert.Fail();
            }
        }

        [TestMethod]
        public void TestParseInvariant() {
            const float c1 = 123.456F;
            string s1 = c1.ToString(CultureInfo.InvariantCulture);
            object c2 = GetValue().ParseInvariant(s1);
            Assert.AreEqual(c1, c2);
        }

        [TestMethod]
        public void TestTitleOf() {
            Assert.AreEqual("3500000", GetValue().DisplayTitleOf(3500000.0F));
        }

        [TestMethod]
        public void TestValue() {
            Assert.AreEqual("32.5", GetValue().DisplayTitleOf(floatObj));
        }

        [TestMethod]
        public override void TestParseNull() {
            base.TestParseNull();
        }


        [TestMethod]
        public override void TestDecodeNull() {
            base.TestDecodeNull();
        }

        [TestMethod]
        public override void TestEmptyEncoding() {
            base.TestEmptyEncoding();
        }
    }

    // Copyright (c) Naked Objects Group Ltd.
}