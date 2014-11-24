// Copyright Naked Objects Group Ltd, 45 Station Road, Henley on Thames, UK, RG9 1AT
// Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. 
// You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
// Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and limitations under the License.

using System;
using System.Reflection;
using NakedObjects.Architecture.Component;
using NakedObjects.Architecture.Facet;
using NakedObjects.Architecture.FacetFactory;
using NakedObjects.Architecture.Reflect;
using NakedObjects.Architecture.Spec;
using NakedObjects.Core.Util;
using NakedObjects.Meta.Facet;
using NakedObjects.Meta.Utils;
using NakedObjects.Util;

namespace NakedObjects.Reflect.FacetFactory {
    public class TableViewAnnotationFacetFactory : AnnotationBasedFacetFactoryAbstract {
        public TableViewAnnotationFacetFactory()
            : base(FeatureType.CollectionsAndActions) {}

        private void Process(MemberInfo member, Type methodReturnType, ISpecification specification) {
            if (CollectionUtils.IsGenericEnumerable(methodReturnType) || CollectionUtils.IsCollection(methodReturnType)) {
                var attribute = AttributeUtils.GetCustomAttribute<TableViewAttribute>(member);
                FacetUtils.AddFacet(Create(attribute, specification));
            }
        }

        private static ITableViewFacet Create(TableViewAttribute attribute, ISpecification holder) {
            return attribute == null ? null : new TableViewFacet(attribute.Title, attribute.Columns, holder);
        }

        public override void Process(IReflector reflector, MethodInfo method, IMethodRemover methodRemover, ISpecificationBuilder specification) {
            Process(method, method.ReturnType, specification);
        }

        public override void Process(IReflector reflector, PropertyInfo property, IMethodRemover methodRemover, ISpecificationBuilder specification) {
            if (property.GetGetMethod() != null) {
                Process(property, property.PropertyType, specification);
            }
        }
    }
}