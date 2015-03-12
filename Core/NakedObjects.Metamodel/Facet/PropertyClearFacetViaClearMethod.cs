// Copyright Naked Objects Group Ltd, 45 Station Road, Henley on Thames, UK, RG9 1AT
// Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. 
// You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
// Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and limitations under the License.

using System;
using System.Reflection;
using NakedObjects.Architecture.Adapter;
using NakedObjects.Architecture.Component;
using NakedObjects.Architecture.Facet;
using NakedObjects.Architecture.Spec;
using NakedObjects.Core.Util;

namespace NakedObjects.Meta.Facet {
    [Serializable]
    public sealed class PropertyClearFacetViaClearMethod : PropertyClearFacetAbstract, IImperativeFacet {
        private readonly MethodInfo method;
        private readonly Func<object, object[], object> methodDelegate;
    

        public PropertyClearFacetViaClearMethod(MethodInfo method, ISpecification holder)
            : base(holder) {
            this.method = method;
            methodDelegate = DelegateUtils.CreateDelegate(method);
        }

        #region IImperativeFacet Members

        public MethodInfo GetMethod() {
            return method;
        }

        public Func<object, object[], object> GetMethodDelegate() {
            return methodDelegate;
        }

        #endregion

        public override void ClearProperty(INakedObject nakedObject, ITransactionManager transactionManager) {
            methodDelegate(nakedObject.GetDomainObject(), new object[] {});
        }

        protected override string ToStringValues() {
            return "method=" + method;
        }
    }
}